import asyncio
import io
import math
import os
import tempfile
import unittest
import zipfile
from datetime import date
from unittest.mock import patch

from fastapi import HTTPException
from starlette.requests import Request

from backend.app import (
    load_settlements,
    parse_csv,
    csv_members,
    parse_mcx_date,
    parse_requested_date,
    research_report,
    upload_bhavcopy,
)
from backend.analytics import CONTRACTS, curve_analytics, gate_results, make_pair_series, trade_economics

CSV_HEADER = "Symbol,Date,ExpiryDate,Open,High,Low,Close,Volume,OpenInterest\n"


class BhavcopyTests(unittest.TestCase):
    @staticmethod
    def request_for(body: bytes, filename: str = "bhavcopy.csv") -> Request:
        sent = False

        async def receive() -> dict[str, object]:
            nonlocal sent
            if sent:
                return {"type": "http.request", "body": b"", "more_body": False}
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        return Request(
            {
                "type": "http",
                "method": "POST",
                "path": "/api/bhavcopy",
                "headers": [(b"x-filename", filename.encode())],
                "query_string": b"",
            },
            receive,
        )

    def test_date_formats_follow_mcx_conventions(self) -> None:
        self.assertEqual(parse_mcx_date("10/23/2026"), date(2026, 10, 23))
        self.assertEqual(parse_mcx_date("04SEP2026"), date(2026, 9, 4))
        self.assertEqual(parse_requested_date("23/10/2026"), date(2026, 10, 23))

    def test_parser_rejects_date_mismatch_and_invalid_ohlc(self) -> None:
        body = (
            CSV_HEADER
            + "GOLDM,10/22/2026,05NOV2026,75000,75200,74800,75100,100,50\n"
            + "GOLDPETAL,10/23/2026,30OCT2026,7500,7400,7480,7510,100,50\n"
        ).encode()
        rows, rejected = parse_csv(body, "daily.csv", date(2026, 10, 23))
        self.assertEqual(rows, [])
        self.assertEqual(len(rejected), 2)
        self.assertIn("does not match requested date", rejected[0]["reason"])
        self.assertIn("high is below another OHLC value", rejected[1]["reason"])

    def test_goldten_is_not_backfilled_before_its_listing_year(self) -> None:
        rows, rejected = parse_csv(
            (CSV_HEADER + "GOLDTEN,12/31/2024,05JAN2025,75000,75100,74900,75020,60,20\n").encode(),
            "history.csv",
            None,
        )
        self.assertEqual(rows, [])
        self.assertIn("2025 listing period", rejected[0]["reason"])

    def test_official_historical_report_headers_are_supported_and_options_are_excluded(self) -> None:
        body = (
            "Instrument,Commodity,Date,Expiry Date,Open,High,Low,Close,Vol (Lots),OI (Lots)\n"
            "FUTCOM,GOLDM,22 Oct 2026,05NOV2026,75000,75200,74800,75100,100,50\n"
            "OPTFUT,GOLDM,22 Oct 2026,05NOV2026,75000,75200,74800,75100,100,50\n"
        ).encode()
        rows, rejected = parse_csv(body, "historical.csv", None)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["symbol"], "GOLDM")
        self.assertEqual(rows[0]["trade_date"], "2026-10-22")
        self.assertEqual(rows[0]["volume"], 100)
        self.assertIn("unsupported instrument type", rejected[0]["reason"])

    def test_zip_upload_accepts_csv_members_without_extracting_them(self) -> None:
        archive_buffer = io.BytesIO()
        with zipfile.ZipFile(archive_buffer, "w") as archive:
            archive.writestr("daily/bhavcopy.csv", CSV_HEADER + "GOLDM,10/22/2026,05NOV2026,75000,75200,74800,75100,100,50\n")
        files = csv_members(archive_buffer.getvalue(), "bhavcopy.zip")
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0][0], "bhavcopy.csv")

    def test_api_rejects_returned_date_mismatch_without_saving_rows(self) -> None:
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"GOLDLENS_DATA_DIR": directory}):
            request = self.request_for(
                (CSV_HEADER + "GOLDM,10/22/2026,05NOV2026,75000,75200,74800,75100,100,50\n").encode(),
                "daily.csv",
            )
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(upload_bhavcopy(request, "23/10/2026"))
            self.assertEqual(raised.exception.status_code, 422)
            self.assertIn("returned date 22/10/2026 does not match requested date 23/10/2026", raised.exception.detail)
            self.assertEqual(load_settlements(), [])

    def test_valid_rows_upload_and_holdout_does_not_claim_performance_early(self) -> None:
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"GOLDLENS_DATA_DIR": directory}):
            body = (CSV_HEADER + (
                " GOLDM ,10/23/2026,05NOV2026,75000,75200,74800,75100,100,50\n"
                "GOLDM,10/24/2026,05NOV2026,75100,75300,75000,75200,120,55\n"
            )).encode()
            response = asyncio.run(upload_bhavcopy(self.request_for(body), None))
            self.assertEqual(response["rowsLoaded"], 2)
            report = research_report(load_settlements(), 20)
            self.assertEqual(report["coverage"]["rows"], 2)
            self.assertEqual(report["backtest"]["status"], "insufficient_data")

    def test_minimum_data_uses_chronological_holdout_and_expiry_specific_series(self) -> None:
        records = []
        for index in range(200):
            day = date(2025, 1, 1).fromordinal(date(2025, 1, 1).toordinal() + index)
            records.append(
                {
                    "symbol": "GOLDPETAL",
                    "trade_date": day.isoformat(),
                    "expiry_date": "2026-12-31",
                    "close": 7500 + (index % 10) * 8,
                    "volume": 100,
                }
            )
        report = research_report(records, 20)
        self.assertEqual(report["backtest"]["status"], "ready")
        self.assertGreaterEqual(report["backtest"]["holdoutStart"], records[139]["trade_date"])
        self.assertEqual(report["backtest"]["tradeCount"], 0)
        self.assertIn("not an independent spot-gold benchmark", report["limitations"][5])

    def test_holdout_pnl_uses_held_expiry_costs_and_separates_common_move_proxy(self) -> None:
        records = []
        start = date(2025, 1, 1)
        for index in range(200):
            day = start.fromordinal(start.toordinal() + index).isoformat()
            goldten_normalized = 7500 + 30 * math.sin(index * 0.9)
            if index == 145:
                goldten_normalized = 7700
            records.extend(
                [
                    {
                        "symbol": "GOLDTEN",
                        "trade_date": day,
                        "expiry_date": "2026-12-31",
                        "close": goldten_normalized * 10,
                        "volume": 10000,
                    },
                    {
                        "symbol": "GOLDGUINEA",
                        "trade_date": day,
                        "expiry_date": "2026-12-31",
                        "close": 7500 * 8,
                        "volume": 10000,
                    },
                ]
            )

        low_cost = research_report(records, 20)["backtest"]
        high_cost = research_report(records, 100)["backtest"]
        spike_trade = next(trade for trade in low_cost["trades"] if trade["entryDate"] == "2025-05-26")
        self.assertEqual(spike_trade["pair"], "GOLDGUINEA / GOLDTEN")
        self.assertEqual(spike_trade["expiryDate"], "2026-12-31")
        self.assertEqual(spike_trade["sideA"], "Long")
        self.assertEqual(spike_trade["sideB"], "Short")
        side_a = 1 if spike_trade["sideA"] == "Long" else -1
        side_b = 1 if spike_trade["sideB"] == "Long" else -1
        multiplier_a = CONTRACTS[spike_trade["symbolA"]]["unit_grams"] / CONTRACTS[spike_trade["symbolA"]]["quote_grams"]
        multiplier_b = CONTRACTS[spike_trade["symbolB"]]["unit_grams"] / CONTRACTS[spike_trade["symbolB"]]["quote_grams"]
        expected_gross = (
            side_a * multiplier_a * spike_trade["lotsA"] * (spike_trade["exitPriceA"] - spike_trade["entryPriceA"])
            + side_b * multiplier_b * spike_trade["lotsB"] * (spike_trade["exitPriceB"] - spike_trade["entryPriceB"])
        )
        self.assertAlmostEqual(spike_trade["grossPnlInr"], expected_gross, places=2)
        self.assertGreater(spike_trade["grossPnlInr"], 0)
        self.assertAlmostEqual(
            spike_trade["netPnlInr"],
            spike_trade["grossPnlInr"] - spike_trade["estimatedCostsInr"],
            places=2,
        )
        self.assertLessEqual(spike_trade["legNotionalImbalancePct"], 5)
        self.assertLess(high_cost["netPnlInr"], low_cost["netPnlInr"])

    def test_latest_signal_requires_cost_and_lifecycle_gates(self) -> None:
        records = []
        start = date(2025, 1, 1)
        for index in range(200):
            day = start.fromordinal(start.toordinal() + index).isoformat()
            goldten_normalized = 7500 + 10 * math.sin(index * 0.9)
            if index == 199:
                goldten_normalized = 7700
            records.extend(
                [
                    {"symbol": "GOLDTEN", "trade_date": day, "expiry_date": "2026-12-31", "close": goldten_normalized * 10, "volume": 10000},
                    {"symbol": "GOLDGUINEA", "trade_date": day, "expiry_date": "2026-12-31", "close": 60000, "volume": 10000},
                ]
            )

        report = research_report(records, 20)
        self.assertEqual(report["backtest"]["status"], "ready")
        self.assertGreaterEqual(len(report["currentSignals"]), 1)
        signal = report["currentSignals"][0]
        self.assertTrue(all(gate["passed"] for gate in signal["gates"]))
        self.assertGreater(signal["expectedNetPnlInr"], 0)

        costly_report = research_report(records, 500)
        self.assertEqual(costly_report["currentSignals"], [])
        self.assertIsNotNone(costly_report["quietReason"])

    def test_pair_series_requires_same_date_and_exact_same_expiry(self) -> None:
        rows = [
            {"symbol": "GOLDM", "trade_date": "2026-01-01", "expiry_date": "2026-02-05", "close": 75000},
            {"symbol": "GOLDTEN", "trade_date": "2026-01-01", "expiry_date": "2026-02-05", "close": 75000},
            {"symbol": "GOLDM", "trade_date": "2026-01-02", "expiry_date": "2026-03-05", "close": 75100},
            {"symbol": "GOLDTEN", "trade_date": "2026-01-02", "expiry_date": "2026-04-05", "close": 75100},
        ]
        pairs = make_pair_series(rows)
        self.assertIn(("GOLDM", "GOLDTEN", "2026-02-05"), pairs)
        self.assertEqual(len(pairs[("GOLDM", "GOLDTEN", "2026-02-05")]), 1)
        self.assertNotIn(("GOLDM", "GOLDTEN", "2026-03-05"), pairs)

    def test_pair_zscore_does_not_use_future_observations(self) -> None:
        records = []
        for index in range(40):
            day = date(2026, 1, 1).fromordinal(date(2026, 1, 1).toordinal() + index).isoformat()
            records.extend(
                [
                    {"symbol": "GOLDTEN", "trade_date": day, "expiry_date": "2026-12-31", "close": 75000 + index * 5},
                    {"symbol": "GOLDGUINEA", "trade_date": day, "expiry_date": "2026-12-31", "close": 60000},
                ]
            )
        before = make_pair_series(records)[("GOLDGUINEA", "GOLDTEN", "2026-12-31")][30]["zScore"]
        for row in records:
            if row["trade_date"] > "2026-01-31" and row["symbol"] == "GOLDTEN":
                row["close"] *= 1.5
        after = make_pair_series(records)[("GOLDGUINEA", "GOLDTEN", "2026-12-31")][30]["zScore"]
        self.assertEqual(before, after)

    def test_signal_gate_rejects_thin_daily_volume(self) -> None:
        records = [
            {"symbol": "GOLDGUINEA", "expiry_date": "2026-12-31", "trade_date": "2026-06-01", "close": 60000, "volume": 1},
            {"symbol": "GOLDTEN", "expiry_date": "2026-12-31", "trade_date": "2026-06-01", "close": 75000, "volume": 1000},
        ]
        signal = {
            "symbolA": "GOLDGUINEA",
            "symbolB": "GOLDTEN",
            "expiryDate": "2026-12-31",
            "date": "2026-06-01",
            "rowA": records[0],
            "rowB": records[1],
            "zScore": 3.0,
            "residualBps": 300,
            "meanBps": 0,
        }
        economics = trade_economics(signal, 10, 0)
        gates = gate_results(signal, economics, 10)
        volume_gate = next(gate for gate in gates if gate["name"] == "Daily-volume participation")
        self.assertFalse(volume_gate["passed"])

    def test_curve_reports_annualized_carry_roll_down_and_lifecycle(self) -> None:
        rows = [
            {"symbol": "GOLDTEN", "trade_date": "2026-01-01", "expiry_date": "2026-02-01", "close": 75000, "volume": 10},
            {"symbol": "GOLDTEN", "trade_date": "2026-01-01", "expiry_date": "2026-03-01", "close": 76000, "volume": 20},
            {"symbol": "GOLDTEN", "trade_date": "2026-01-02", "expiry_date": "2026-02-01", "close": 75010, "volume": 20},
            {"symbol": "GOLDTEN", "trade_date": "2026-01-02", "expiry_date": "2026-03-01", "close": 76010, "volume": 40},
        ]
        curve, roll_down, lifecycle = curve_analytics(rows, "2026-01-02")
        self.assertEqual(len(curve), 1)
        self.assertGreater(curve[0]["annualizedCarryPct"], 0)
        self.assertEqual(len(roll_down), 1)
        self.assertEqual(len(lifecycle), 2)
        self.assertEqual(lifecycle[0]["firstObservedDate"], "2026-01-01")
        self.assertEqual(lifecycle[0]["rollingMedianVolumeLots"], 15)
        self.assertEqual(lifecycle[0]["volumeVsMedianPct"], 133.33)
        point = roll_down[0]
        self.assertAlmostEqual(
            point["observedMoveInrPerGram999"],
            point["rollDownInrPerGram999"] + point["genuineCurveChangeInrPerGram999"],
            places=5,
        )


if __name__ == "__main__":
    unittest.main()
