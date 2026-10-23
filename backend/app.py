from __future__ import annotations

import csv
import io
import math
import os
import re
import sqlite3
import zipfile
from contextlib import closing
from datetime import date, datetime
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.analytics import CONTRACTS, research_report

HEADER_ALIASES = {
    "symbol": ("symbol", "commodity"),
    "date": ("date", "tradedate"),
    "expirydate": ("expirydate", "expiry"),
    "open": ("open",),
    "high": ("high",),
    "low": ("low",),
    "close": ("close",),
    "volume": ("volume", "vollots", "vol", "volume000s"),
    "openinterest": ("openinterest", "oi", "oilots", "openinterestlots"),
}
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
MAX_ARCHIVE_CSV_BYTES = 80 * 1024 * 1024
MAX_ARCHIVE_CSV_FILES = 40
app = FastAPI(title="GoldLens MCX Research API", version="0.1.0")
allowed_origins = os.getenv(
    "GOLDLENS_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Filename"],
)


def database_path() -> Path:
    configured = os.getenv("GOLDLENS_DATA_DIR")
    return Path(configured) / "goldlens.sqlite3" if configured else Path(__file__).parent / "data" / "goldlens.sqlite3"


def connect_database() -> sqlite3.Connection:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS settlements (
            symbol TEXT NOT NULL,
            trade_date TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            open REAL NOT NULL,
            high REAL NOT NULL,
            low REAL NOT NULL,
            close REAL NOT NULL,
            volume REAL NOT NULL,
            open_interest REAL NOT NULL,
            source_file TEXT NOT NULL,
            PRIMARY KEY (symbol, trade_date, expiry_date)
        )
        """
    )
    return connection


def parse_mcx_date(value: str) -> date:
    cleaned = value.strip().upper()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d%b%Y", "%d-%b-%Y", "%d %b %Y"):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"unrecognized date format: {value!r}")


def parse_requested_date(value: str) -> date:
    try:
        return datetime.strptime(value.strip(), "%d/%m/%Y").date()
    except ValueError as error:
        raise ValueError("requested date must use DD/MM/YYYY") from error


def parse_number(value: str, column: str) -> float:
    cleaned = value.strip().replace(",", "")
    if not cleaned:
        raise ValueError(f"{column} is blank")
    number = float(cleaned)
    if not math.isfinite(number):
        raise ValueError(f"{column} must be finite")
    return number


def normalize_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.strip().lower())


def csv_members(contents: bytes, filename: str) -> list[tuple[str, bytes]]:
    if filename.lower().endswith(".zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(contents)) as archive:
                members = [
                    item for item in archive.infolist()
                    if not item.is_dir() and item.filename.lower().endswith(".csv")
                ]
                if not members:
                    raise ValueError("ZIP archive contains no CSV files")
                if len(members) > MAX_ARCHIVE_CSV_FILES:
                    raise ValueError(f"ZIP archive contains more than {MAX_ARCHIVE_CSV_FILES} CSV files")
                total_size = sum(item.file_size for item in members)
                if total_size > MAX_ARCHIVE_CSV_BYTES:
                    raise ValueError("uncompressed CSV data exceeds the 80 MB limit")
                return [(Path(item.filename).name, archive.read(item)) for item in members]
        except zipfile.BadZipFile as error:
            raise ValueError("uploaded ZIP file is invalid") from error
    if not filename.lower().endswith(".csv"):
        raise ValueError("upload a CSV or ZIP containing CSV files")
    return [(Path(filename).name, contents)]


def parse_csv(contents: bytes, filename: str, requested: date | None) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = contents.decode("cp1252")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError(f"{filename}: CSV has no header row")
    header_map = {normalize_header(field): field for field in reader.fieldnames if field}
    column_map = {
        required: next((header_map[alias] for alias in aliases if alias in header_map), None)
        for required, aliases in HEADER_ALIASES.items()
    }
    missing = sorted(required for required, source in column_map.items() if source is None)
    if missing:
        raise ValueError(f"{filename}: missing required columns: {', '.join(missing)}")
    resolved_columns = {
        required: source for required, source in column_map.items() if source is not None
    }

    rows: list[dict[str, Any]] = []
    rejected: list[dict[str, str]] = []
    for line_number, item in enumerate(reader, start=2):
        try:
            symbol = (item.get(resolved_columns["symbol"]) or "").strip().upper()
            if symbol not in CONTRACTS:
                raise ValueError(f"unsupported or blank symbol: {symbol or '(blank)'}")
            instrument_column = header_map.get("instrument")
            instrument = (item.get(instrument_column) or "").strip().upper() if instrument_column else ""
            if instrument and instrument not in {"FUTCOM", "FUTCOMMODITY"}:
                raise ValueError(f"unsupported instrument type: {instrument}")
            trade_date = parse_mcx_date(item.get(resolved_columns["date"]) or "")
            expiry_date = parse_mcx_date(item.get(resolved_columns["expirydate"]) or "")
            if symbol == "GOLDTEN" and trade_date < date(2025, 1, 1):
                raise ValueError("GOLDTEN is only included from its 2025 listing period onward")
            if requested and trade_date != requested:
                raise ValueError(
                    f"returned date {trade_date:%d/%m/%Y} does not match requested date {requested:%d/%m/%Y}"
                )
            if trade_date > expiry_date:
                raise ValueError("trade date is after contract expiry")
            prices = {
                name: parse_number(item.get(resolved_columns[name]) or "", name)
                for name in ("open", "high", "low", "close")
            }
            if any(value <= 0 for value in prices.values()):
                raise ValueError("OHLC prices must be positive")
            if prices["high"] < max(prices["open"], prices["close"], prices["low"]):
                raise ValueError("high is below another OHLC value")
            if prices["low"] > min(prices["open"], prices["close"], prices["high"]):
                raise ValueError("low is above another OHLC value")
            volume = parse_number(item.get(resolved_columns["volume"]) or "", "volume")
            open_interest = parse_number(item.get(resolved_columns["openinterest"]) or "", "open interest")
            if volume < 0 or open_interest < 0:
                raise ValueError("volume and open interest cannot be negative")
            rows.append(
                {
                    "symbol": symbol,
                    "trade_date": trade_date.isoformat(),
                    "expiry_date": expiry_date.isoformat(),
                    **prices,
                    "volume": volume,
                    "open_interest": open_interest,
                    "source_file": filename,
                }
            )
        except (ValueError, TypeError) as error:
            rejected.append({"file": filename, "line": str(line_number), "reason": str(error)})
    return rows, rejected


def load_settlements() -> list[dict[str, Any]]:
    with closing(connect_database()) as connection:
        records = connection.execute(
            "SELECT symbol, trade_date, expiry_date, open, high, low, close, volume, open_interest "
            "FROM settlements ORDER BY trade_date, symbol, expiry_date"
        ).fetchall()
    return [dict(row) for row in records]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "goldlens-research"}


@app.get("/api/research")
def get_research(round_trip_cost_bps: float = Query(default=20, ge=0, le=500)) -> dict[str, Any]:
    return research_report(load_settlements(), round_trip_cost_bps)


@app.post("/api/bhavcopy")
async def upload_bhavcopy(
    request: Request,
    requested_date: str | None = Query(default=None),
) -> dict[str, Any]:
    filename = request.headers.get("X-Filename", "bhavcopy.csv")
    safe_filename = Path(filename).name
    if not safe_filename:
        raise HTTPException(status_code=400, detail="X-Filename header is required")
    chunks: list[bytes] = []
    total_bytes = 0
    async for chunk in request.stream():
        total_bytes += len(chunk)
        if total_bytes > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="upload exceeds the 20 MB limit")
        chunks.append(chunk)
    contents = b"".join(chunks)
    if not contents:
        raise HTTPException(status_code=400, detail="uploaded file is empty")
    try:
        requested = parse_requested_date(requested_date) if requested_date else None
        files = csv_members(contents, safe_filename)
        parsed: list[dict[str, Any]] = []
        rejected: list[dict[str, str]] = []
        for member_name, member_contents in files:
            member_rows, member_rejected = parse_csv(member_contents, member_name, requested)
            parsed.extend(member_rows)
            rejected.extend(member_rejected)
    except (ValueError, UnicodeDecodeError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    seen: set[tuple[str, str, str]] = set()
    unique_rows = []
    for row in parsed:
        key = (row["symbol"], row["trade_date"], row["expiry_date"])
        if key in seen:
            rejected.append({"file": safe_filename, "line": "multiple", "reason": f"duplicate contract/date row: {' / '.join(key)}"})
            continue
        seen.add(key)
        unique_rows.append(row)
    if requested and not any(row["trade_date"] == requested.isoformat() for row in unique_rows):
        mismatch = next(
            (item["reason"] for item in rejected if "does not match requested date" in item["reason"]),
            "the selected file contains no matching trade date",
        )
        raise HTTPException(
            status_code=422,
            detail=f"{mismatch}; no data was saved",
        )
    if not unique_rows:
        reasons = "; ".join(
            f"{item['file']} line {item['line']}: {item['reason']}" for item in rejected[:5]
        )
        suffix = f" Details: {reasons}" if reasons else ""
        raise HTTPException(
            status_code=422,
            detail=f"file contains no valid settlement rows; no data was saved.{suffix}",
        )

    with closing(connect_database()) as connection:
        connection.executemany(
            """
            INSERT INTO settlements
                (symbol, trade_date, expiry_date, open, high, low, close, volume, open_interest, source_file)
            VALUES
                (:symbol, :trade_date, :expiry_date, :open, :high, :low, :close, :volume, :open_interest, :source_file)
            ON CONFLICT(symbol, trade_date, expiry_date) DO UPDATE SET
                open=excluded.open, high=excluded.high, low=excluded.low, close=excluded.close,
                volume=excluded.volume, open_interest=excluded.open_interest, source_file=excluded.source_file
            """,
            unique_rows,
        )
        connection.commit()
    return {
        "filename": safe_filename,
        "rowsLoaded": len(unique_rows),
        "rowsRejected": len(rejected),
        "rejected": rejected[:100],
        "truncatedRejections": max(0, len(rejected) - 100),
        "dateValidation": "validated against requested date" if requested else "not requested",
    }
