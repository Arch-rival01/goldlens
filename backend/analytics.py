from __future__ import annotations

import itertools
import math
from collections import defaultdict
from datetime import date
from typing import Any

CONTRACTS: dict[str, dict[str, float]] = {
    "GOLDM": {"unit_grams": 100, "quote_grams": 10, "purity": 0.995},
    "GOLDTEN": {"unit_grams": 10, "quote_grams": 10, "purity": 0.999},
    "GOLDGUINEA": {"unit_grams": 8, "quote_grams": 8, "purity": 0.999},
    "GOLDPETAL": {"unit_grams": 1, "quote_grams": 1, "purity": 0.999},
}
LOOKBACK = 20
ENTRY_Z = 2.0
MAX_HOLD_SESSIONS = 5
EXPIRY_BUFFER_DAYS = 5
MIN_SESSIONS = 200
MIN_HOLDOUT_SESSIONS = 60
MAX_LOTS_PER_LEG = 100
MAX_LEG_NOTIONAL_IMBALANCE_PCT = 5.0
MAX_VOLUME_PARTICIPATION_PCT = 5.0


def normalized_price(row: dict[str, Any]) -> float:
    contract = CONTRACTS[row["symbol"]]
    return row["close"] / contract["quote_grams"] * (0.999 / contract["purity"])


def lot_notional(row: dict[str, Any]) -> float:
    contract = CONTRACTS[row["symbol"]]
    return row["close"] * contract["unit_grams"] / contract["quote_grams"]


def balanced_lots(row_a: dict[str, Any], row_b: dict[str, Any]) -> dict[str, Any] | None:
    notional_a = lot_notional(row_a)
    notional_b = lot_notional(row_b)
    choices: list[tuple[float, float, int, int, int, float, float]] = []
    for lots_a in range(1, MAX_LOTS_PER_LEG + 1):
        target_b = lots_a * notional_a / notional_b
        candidate_lots_b = {
            math.floor(target_b),
            round(target_b),
            math.ceil(target_b),
        }
        for lots_b in candidate_lots_b:
            if not 1 <= lots_b <= MAX_LOTS_PER_LEG:
                continue
            gross_a = lots_a * notional_a
            gross_b = lots_b * notional_b
            average = (gross_a + gross_b) / 2
            imbalance = abs(gross_a - gross_b) / average * 100
            if imbalance <= MAX_LEG_NOTIONAL_IMBALANCE_PCT:
                choices.append((average, imbalance, lots_a + lots_b, lots_a, lots_b, gross_a, gross_b))
    if not choices:
        return None
    average, imbalance, _, lots_a, lots_b, gross_a, gross_b = min(choices)
    return {
        "lotsA": lots_a,
        "lotsB": lots_b,
        "notionalA": gross_a,
        "notionalB": gross_b,
        "imbalancePct": imbalance,
        "averageLegNotional": average,
    }


def rolling_scores(rows: list[dict[str, Any]]) -> None:
    residuals: list[float] = []
    for row in rows:
        if len(residuals) >= LOOKBACK:
            history = residuals[-LOOKBACK:]
            mean = sum(history) / LOOKBACK
            variance = sum((value - mean) ** 2 for value in history) / LOOKBACK
            sd = math.sqrt(variance)
            row["meanBps"] = mean
            row["sdBps"] = sd
            row["zScore"] = (row["residualBps"] - mean) / sd if sd else 0.0
        else:
            row["meanBps"] = None
            row["sdBps"] = None
            row["zScore"] = None
        residuals.append(row["residualBps"])


def interpolate_curve(points: list[tuple[float, float]], target_days: float) -> float | None:
    ordered = sorted(points)
    for (left_days, left_price), (right_days, right_price) in zip(ordered, ordered[1:]):
        if left_days <= target_days <= right_days:
            if right_days == left_days:
                return left_price
            weight = (target_days - left_days) / (right_days - left_days)
            return left_price + weight * (right_price - left_price)
    return None


def curve_analytics(records: list[dict[str, Any]], latest_date: str | None) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    by_date_symbol: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    by_security: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        by_date_symbol[(record["trade_date"], record["symbol"])].append(record)
        by_security[(record["symbol"], record["expiry_date"])].append(record)

    curve: list[dict[str, Any]] = []
    if latest_date:
        for symbol in CONTRACTS:
            rows = by_date_symbol.get((latest_date, symbol), [])
            rows.sort(key=lambda row: row["expiry_date"])
            for near, far in zip(rows, rows[1:]):
                near_days = (date.fromisoformat(near["expiry_date"]) - date.fromisoformat(latest_date)).days
                far_days = (date.fromisoformat(far["expiry_date"]) - date.fromisoformat(latest_date)).days
                if near_days < 0 or far_days <= near_days:
                    continue
                near_price = normalized_price(near)
                far_price = normalized_price(far)
                tenor_days = far_days - near_days
                carry = ((far_price / near_price) ** (365 / tenor_days) - 1) * 100
                curve.append(
                    {
                        "symbol": symbol,
                        "asOfDate": latest_date,
                        "nearExpiry": near["expiry_date"],
                        "farExpiry": far["expiry_date"],
                        "nearDaysToExpiry": near_days,
                        "farDaysToExpiry": far_days,
                        "nearPricePerGram999": round(near_price, 4),
                        "farPricePerGram999": round(far_price, 4),
                        "annualizedCarryPct": round(carry, 4),
                    }
                )

    roll_down: list[dict[str, Any]] = []
    for (symbol, expiry), series in by_security.items():
        series.sort(key=lambda row: row["trade_date"])
        for current, following in zip(series, series[1:]):
            elapsed = (date.fromisoformat(following["trade_date"]) - date.fromisoformat(current["trade_date"])).days
            tenor = (date.fromisoformat(expiry) - date.fromisoformat(current["trade_date"])).days
            if elapsed <= 0 or tenor <= elapsed:
                continue
            curve_points = []
            for row in by_date_symbol[(current["trade_date"], symbol)]:
                days = (date.fromisoformat(row["expiry_date"]) - date.fromisoformat(current["trade_date"])).days
                if days >= 0:
                    curve_points.append((days, normalized_price(row)))
            predicted = interpolate_curve(curve_points, tenor - elapsed)
            if predicted is None:
                continue
            current_price = normalized_price(current)
            observed_move = normalized_price(following) - current_price
            roll_move = predicted - current_price
            roll_down.append(
                {
                    "symbol": symbol,
                    "expiryDate": expiry,
                    "fromDate": current["trade_date"],
                    "toDate": following["trade_date"],
                    "rollDownInrPerGram999": round(roll_move, 5),
                    "observedMoveInrPerGram999": round(observed_move, 5),
                    "genuineCurveChangeInrPerGram999": round(observed_move - roll_move, 5),
                }
            )
    roll_down.sort(key=lambda row: (row["toDate"], row["symbol"], row["expiryDate"]))

    lifecycle: list[dict[str, Any]] = []
    for (symbol, expiry), series in by_security.items():
        series.sort(key=lambda row: row["trade_date"])
        latest = max(series, key=lambda row: row["trade_date"])
        as_of = latest["trade_date"]
        days = (date.fromisoformat(expiry) - date.fromisoformat(as_of)).days
        recent_volumes = sorted(row["volume"] for row in series[-LOOKBACK:])
        middle = len(recent_volumes) // 2
        median_volume = (
            recent_volumes[middle]
            if len(recent_volumes) % 2
            else (recent_volumes[middle - 1] + recent_volumes[middle]) / 2
        )
        lifecycle.append(
            {
                "symbol": symbol,
                "expiryDate": expiry,
                "firstObservedDate": series[0]["trade_date"],
                "asOfDate": as_of,
                "daysToExpiry": days,
                "phase": "Expiry safety buffer" if days <= EXPIRY_BUFFER_DAYS else "Pre-expiry",
                "newEntriesAllowed": days > EXPIRY_BUFFER_DAYS,
                "latestVolumeLots": latest["volume"],
                "rollingMedianVolumeLots": median_volume,
                "volumeVsMedianPct": round(latest["volume"] / median_volume * 100, 2) if median_volume else None,
            }
        )
    lifecycle.sort(key=lambda row: (row["daysToExpiry"], row["symbol"]))
    return curve, roll_down[-100:], lifecycle[:100]


def make_pair_series(records: list[dict[str, Any]]) -> dict[tuple[str, str, str], list[dict[str, Any]]]:
    by_date_security = {
        (row["symbol"], row["expiry_date"], row["trade_date"]): row for row in records
    }
    expiry_groups: dict[str, set[str]] = defaultdict(set)
    by_security: dict[tuple[str, str], dict[str, dict[str, Any]]] = defaultdict(dict)
    for symbol, expiry, _ in by_date_security:
        expiry_groups[expiry].add(symbol)
    for (symbol, expiry, day), row in by_date_security.items():
        by_security[(symbol, expiry)][day] = row
    series: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for expiry, symbols in expiry_groups.items():
        for symbol_a, symbol_b in itertools.combinations(sorted(symbols), 2):
            rows_a = by_security[(symbol_a, expiry)]
            rows_b = by_security[(symbol_b, expiry)]
            common_dates = rows_a.keys() & rows_b.keys()
            pair_rows = []
            for day in sorted(common_dates):
                row_a = rows_a[day]
                row_b = rows_b[day]
                price_a = normalized_price(row_a)
                price_b = normalized_price(row_b)
                pair_rows.append(
                    {
                        "pairIndex": len(pair_rows),
                        "symbolA": symbol_a,
                        "symbolB": symbol_b,
                        "expiryDate": expiry,
                        "date": day,
                        "rowA": row_a,
                        "rowB": row_b,
                        "priceA": price_a,
                        "priceB": price_b,
                        "residualBps": math.log(price_a / price_b) * 10_000,
                    }
                )
            if pair_rows:
                rolling_scores(pair_rows)
                series[(symbol_a, symbol_b, expiry)] = pair_rows
    return series


def trade_economics(
    signal: dict[str, Any],
    round_trip_cost_bps: float,
    target_residual_bps: float,
) -> dict[str, Any] | None:
    sizing = balanced_lots(signal["rowA"], signal["rowB"])
    if sizing is None:
        return None
    delta = (signal["residualBps"] - target_residual_bps) / 10_000
    side_a = -1 if delta > 0 else 1
    side_b = -side_a
    target_a = signal["rowA"]["close"] * math.exp(-delta / 2)
    target_b = signal["rowB"]["close"] * math.exp(delta / 2)
    contract_a = CONTRACTS[signal["symbolA"]]
    contract_b = CONTRACTS[signal["symbolB"]]
    multiplier_a = contract_a["unit_grams"] / contract_a["quote_grams"]
    multiplier_b = contract_b["unit_grams"] / contract_b["quote_grams"]
    entry_a = lot_notional(signal["rowA"]) * sizing["lotsA"]
    entry_b = lot_notional(signal["rowB"]) * sizing["lotsB"]
    target_a_notional = target_a * multiplier_a * sizing["lotsA"]
    target_b_notional = target_b * multiplier_b * sizing["lotsB"]
    gross = (
        side_a * multiplier_a * sizing["lotsA"] * (target_a - signal["rowA"]["close"])
        + side_b * multiplier_b * sizing["lotsB"] * (target_b - signal["rowB"]["close"])
    )
    average_gross_notional = (
        entry_a + entry_b + target_a_notional + target_b_notional
    ) / 2
    costs = average_gross_notional * round_trip_cost_bps / 10_000
    return {
        **sizing,
        "sideA": side_a,
        "sideB": side_b,
        "expectedGrossPnlInr": gross,
        "estimatedCostsInr": costs,
        "expectedNetPnlInr": gross - costs,
        "expectedNetEdgeBps": (gross - costs) / average_gross_notional * 10_000,
        "targetPriceA": target_a,
        "targetPriceB": target_b,
    }


def gate_results(signal: dict[str, Any], economics: dict[str, Any] | None, round_trip_cost_bps: float) -> list[dict[str, Any]]:
    days_to_expiry = (
        date.fromisoformat(signal["expiryDate"]) - date.fromisoformat(signal["date"])
    ).days
    if economics is None:
        size_passed = False
        volume_passed = False
        volume_detail = "No integer-lot sizing within 5% notional imbalance and 100 lots per leg."
        net_passed = False
    else:
        size_passed = economics["imbalancePct"] <= MAX_LEG_NOTIONAL_IMBALANCE_PCT
        volume_a = signal["rowA"]["volume"]
        volume_b = signal["rowB"]["volume"]
        required_a = economics["lotsA"] * 100 / MAX_VOLUME_PARTICIPATION_PCT
        required_b = economics["lotsB"] * 100 / MAX_VOLUME_PARTICIPATION_PCT
        volume_passed = volume_a >= required_a and volume_b >= required_b
        volume_detail = (
            f"{signal['symbolA']} {volume_a:g}/{required_a:g} lots; "
            f"{signal['symbolB']} {volume_b:g}/{required_b:g} lots minimum"
        )
        net_passed = economics["expectedNetPnlInr"] > 0
    z_score = signal["zScore"]
    return [
        {"name": "Matched expiry and quotes", "passed": True, "detail": f"Both legs expire {signal['expiryDate']}."},
        {"name": "Relative-value dislocation", "passed": z_score is not None and abs(z_score) >= ENTRY_Z, "detail": f"|z|={abs(z_score or 0):.2f}; threshold {ENTRY_Z:.1f}."},
        {"name": "Integer lot balance", "passed": size_passed, "detail": f"{economics['imbalancePct']:.2f}% gross-notional imbalance." if economics else "No compliant size."},
        {"name": "Daily-volume participation", "passed": volume_passed, "detail": f"Each leg must trade at no more than {MAX_VOLUME_PARTICIPATION_PCT:g}% of reported volume; {volume_detail}"},
        {"name": "Expiry safety buffer", "passed": days_to_expiry > EXPIRY_BUFFER_DAYS, "detail": f"{days_to_expiry} calendar days to expiry; entries stop inside {EXPIRY_BUFFER_DAYS} days."},
        {"name": "Expected edge after assumed costs", "passed": net_passed, "detail": f"Estimated round-trip friction {round_trip_cost_bps:g} bps on combined leg notional."},
    ]


def settled_trade(
    position: dict[str, Any],
    exit_row: dict[str, Any],
    exit_reason: str,
    round_trip_cost_bps: float,
) -> dict[str, Any]:
    entry = position["entry"]
    economics = position["economics"]
    side_a = economics["sideA"]
    side_b = economics["sideB"]
    sizing = economics
    contract_a = CONTRACTS[entry["symbolA"]]
    contract_b = CONTRACTS[entry["symbolB"]]
    multiplier_a = contract_a["unit_grams"] / contract_a["quote_grams"]
    multiplier_b = contract_b["unit_grams"] / contract_b["quote_grams"]
    pnl_a = side_a * multiplier_a * sizing["lotsA"] * (exit_row["rowA"]["close"] - entry["rowA"]["close"])
    pnl_b = side_b * multiplier_b * sizing["lotsB"] * (exit_row["rowB"]["close"] - entry["rowB"]["close"])
    gross = pnl_a + pnl_b
    entry_notional = (
        lot_notional(entry["rowA"]) * sizing["lotsA"]
        + lot_notional(entry["rowB"]) * sizing["lotsB"]
    )
    exit_notional = (
        lot_notional(exit_row["rowA"]) * sizing["lotsA"]
        + lot_notional(exit_row["rowB"]) * sizing["lotsB"]
    )
    costs = (entry_notional + exit_notional) / 2 * round_trip_cost_bps / 10_000
    return_a = normalized_price(exit_row["rowA"]) / normalized_price(entry["rowA"]) - 1
    return_b = normalized_price(exit_row["rowB"]) / normalized_price(entry["rowB"]) - 1
    shared_move = (return_a + return_b) / 2
    net_directional_exposure = side_a * entry_notional * (
        lot_notional(entry["rowA"]) * sizing["lotsA"] / entry_notional
    ) + side_b * entry_notional * (
        lot_notional(entry["rowB"]) * sizing["lotsB"] / entry_notional
    )
    common_move_proxy = net_directional_exposure * shared_move
    net = gross - costs
    return {
        "pair": f"{entry['symbolA']} / {entry['symbolB']}",
        "symbolA": entry["symbolA"],
        "symbolB": entry["symbolB"],
        "expiryDate": entry["expiryDate"],
        "longSymbol": entry["symbolA"] if side_a > 0 else entry["symbolB"],
        "shortSymbol": entry["symbolB"] if side_a > 0 else entry["symbolA"],
        "lotsA": sizing["lotsA"],
        "lotsB": sizing["lotsB"],
        "sideA": "Long" if side_a > 0 else "Short",
        "sideB": "Long" if side_b > 0 else "Short",
        "entryDate": entry["date"],
        "exitDate": exit_row["date"],
        "entryPriceA": entry["rowA"]["close"],
        "entryPriceB": entry["rowB"]["close"],
        "exitPriceA": exit_row["rowA"]["close"],
        "exitPriceB": exit_row["rowB"]["close"],
        "quoteBaseGramsA": contract_a["quote_grams"],
        "quoteBaseGramsB": contract_b["quote_grams"],
        "entryZ": round(entry["zScore"], 3),
        "exitZ": round(exit_row["zScore"], 3) if exit_row["zScore"] is not None else None,
        "holdSessions": exit_row["pairIndex"] - entry["pairIndex"],
        "exitReason": exit_reason,
        "grossPnlInr": round(gross, 2),
        "estimatedCostsInr": round(costs, 2),
        "netPnlInr": round(net, 2),
        "commonMoveProxyPnlInr": round(common_move_proxy, 2),
        "netAfterCommonMoveProxyInr": round(net - common_move_proxy, 2),
        "legNotionalImbalancePct": round(sizing["imbalancePct"], 3),
    }


def research_report(records: list[dict[str, Any]], round_trip_cost_bps: float) -> dict[str, Any]:
    dates = sorted({record["trade_date"] for record in records})
    latest_date = dates[-1] if dates else None
    coverage = {
        "rows": len(records),
        "contracts": len({(row["symbol"], row["expiry_date"]) for row in records}),
        "symbols": sorted({row["symbol"] for row in records}),
        "firstDate": dates[0] if dates else None,
        "lastDate": latest_date,
        "sessions": len(dates),
    }
    curve, roll_down, lifecycle = curve_analytics(records, latest_date)
    pair_series = make_pair_series(records)
    base: dict[str, Any] = {
        "coverage": coverage,
        "configuration": {
            "lookbackSessions": LOOKBACK,
            "entryZ": ENTRY_Z,
            "maxHoldSessions": MAX_HOLD_SESSIONS,
            "expiryBufferCalendarDays": EXPIRY_BUFFER_DAYS,
            "roundTripCostBps": round_trip_cost_bps,
            "oneWayCostBps": round_trip_cost_bps / 2,
            "volumeParticipationPct": MAX_VOLUME_PARTICIPATION_PCT,
            "maxLegNotionalImbalancePct": MAX_LEG_NOTIONAL_IMBALANCE_PCT,
        },
        "currentSignals": [],
        "quietReason": (
            "No settlement data has been imported."
            if not records
            else "No synchronized expiry-matched pair has cleared the entry, cost, volume-participation, and expiry gates."
        ),
        "curve": curve,
        "rollDown": roll_down,
        "lifecycle": lifecycle,
        "backtest": {
            "status": "insufficient_data",
            "holdoutStart": None,
            "holdoutEnd": latest_date,
            "trades": [],
            "tradeCount": 0,
            "grossPnlInr": 0,
            "estimatedCostsInr": 0,
            "netPnlInr": 0,
            "commonMoveProxyPnlInr": 0,
            "netAfterCommonMoveProxyInr": 0,
            "winRatePct": None,
            "averageHoldSessions": None,
            "message": f"Upload at least {MIN_SESSIONS} distinct sessions to reserve at least {MIN_HOLDOUT_SESSIONS} for a walk-forward holdout.",
        },
        "limitations": [
            "MCX settlement marks are not executable fills. The round-trip friction parameter is an assumption, not observed bid/ask or verified charges.",
            "The relative-value spread compares simultaneous, exact-expiry, purity-normalized settlement prices. It is an analytical proxy, not guaranteed arbitrage parity.",
            "Whole-lot sizes are constrained to at most 100 lots per leg and a maximum 5% gross-notional mismatch. Simulated overlapping legs are blocked during walk-forward replay.",
            "Reported volume is only a participation screen, not market depth or a measure of executable liquidity.",
            "Expiry-based blackout is a conservative proxy. Official tender commencement dates and contract-specific lifecycle notices are not present in bhavcopy and are not inferred.",
            "Common-move attribution uses the two held contracts' shared normalized return, not an independent spot-gold benchmark.",
            "Parameters are fixed and exploratory; results are not an investment recommendation.",
        ],
    }
    if records and not pair_series:
        base["quietReason"] = "No contracts share both a trade date and an exact expiry, so there is no matched pair to evaluate."
    if len(dates) < MIN_SESSIONS:
        base["quietReason"] = base["backtest"]["message"]
        return base
    holdout_index = max(int(len(dates) * 0.7), LOOKBACK + 1)
    if len(dates) - holdout_index < MIN_HOLDOUT_SESSIONS:
        return base
    holdout_start = dates[holdout_index]
    by_pair_date: dict[str, list[tuple[tuple[str, str, str], int, dict[str, Any]]]] = defaultdict(list)
    for key, rows in pair_series.items():
        for pair_index, row in enumerate(rows):
            if row["date"] >= holdout_start and row["zScore"] is not None:
                row["pairIndex"] = pair_index
                by_pair_date[row["date"]].append((key, pair_index, row))

    positions: dict[tuple[str, str, str], dict[str, Any]] = {}
    locked_contracts: set[tuple[str, str]] = set()
    trades: list[dict[str, Any]] = []
    current_signals: list[dict[str, Any]] = []
    holdout_dates = [day for day in dates[holdout_index:]]
    for day in holdout_dates:
        day_signals = by_pair_date.get(day, [])
        by_key = {key: (pair_index, row) for key, pair_index, row in day_signals}
        closed_today: set[tuple[str, str, str]] = set()
        for key, position in list(positions.items()):
            current = by_key.get(key)
            if current is None:
                continue
            pair_index, row = current
            side_a = position["economics"]["sideA"]
            held = pair_index - position["entry"]["pairIndex"]
            days_to_expiry = (date.fromisoformat(key[2]) - date.fromisoformat(day)).days
            exit_reason = None
            if row["zScore"] * side_a >= 0:
                exit_reason = "Mean reversion"
            elif held >= MAX_HOLD_SESSIONS:
                exit_reason = "Maximum hold"
            elif days_to_expiry <= EXPIRY_BUFFER_DAYS:
                exit_reason = "Expiry safety buffer"
            if exit_reason:
                trades.append(settled_trade(position, row, exit_reason, round_trip_cost_bps))
                locked_contracts.discard((key[0], key[2]))
                locked_contracts.discard((key[1], key[2]))
                del positions[key]
                closed_today.add(key)

        candidates = []
        for key, pair_index, row in day_signals:
            if abs(row["zScore"]) < ENTRY_Z:
                continue
            economics = trade_economics(row, round_trip_cost_bps, row["meanBps"])
            gates = gate_results(row, economics, round_trip_cost_bps)
            row["economics"] = economics
            row["gates"] = gates
            if all(gate["passed"] for gate in gates):
                candidates.append((key, pair_index, row, economics))
        candidates.sort(key=lambda item: item[3]["expectedNetEdgeBps"], reverse=True)
        for key, pair_index, row, economics in candidates:
            if key in positions or key in closed_today:
                continue
            security_a = (key[0], key[2])
            security_b = (key[1], key[2])
            if security_a in locked_contracts or security_b in locked_contracts:
                continue
            position = {
                "entry": {**row, "pairIndex": pair_index},
                "economics": economics,
            }
            positions[key] = position
            locked_contracts.add(security_a)
            locked_contracts.add(security_b)
            if day == latest_date:
                current_signals.append(
                    {
                        "pair": f"{key[0]} / {key[1]}",
                        "symbolA": key[0],
                        "symbolB": key[1],
                        "expiryDate": key[2],
                        "asOfDate": day,
                        "residualBps": round(row["residualBps"], 3),
                        "meanBps": round(row["meanBps"], 3),
                        "zScore": round(row["zScore"], 3),
                        "sideA": "Long" if economics["sideA"] > 0 else "Short",
                        "sideB": "Long" if economics["sideB"] > 0 else "Short",
                        "lotsA": economics["lotsA"],
                        "lotsB": economics["lotsB"],
                        "expectedGrossPnlInr": round(economics["expectedGrossPnlInr"], 2),
                        "estimatedCostsInr": round(economics["estimatedCostsInr"], 2),
                        "expectedNetPnlInr": round(economics["expectedNetPnlInr"], 2),
                        "expectedNetEdgeBps": round(economics["expectedNetEdgeBps"], 2),
                        "legNotionalImbalancePct": round(economics["imbalancePct"], 3),
                        "daysToExpiry": (date.fromisoformat(key[2]) - date.fromisoformat(day)).days,
                        "gates": gates,
                    }
                )

    for key, position in list(positions.items()):
        rows = pair_series[key]
        entry_index = position["entry"]["pairIndex"]
        last = next((row for row in reversed(rows) if row["pairIndex"] >= entry_index), None)
        if last and last["pairIndex"] > entry_index:
            trades.append(settled_trade(position, last, "End of holdout", round_trip_cost_bps))

    trades.sort(key=lambda trade: (trade["exitDate"], trade["entryDate"], trade["pair"]))
    gross = sum(trade["grossPnlInr"] for trade in trades)
    costs = sum(trade["estimatedCostsInr"] for trade in trades)
    net = gross - costs
    common_move_proxy = sum(trade["commonMoveProxyPnlInr"] for trade in trades)
    excess = sum(trade["netAfterCommonMoveProxyInr"] for trade in trades)
    base["currentSignals"] = current_signals
    if current_signals:
        base["quietReason"] = None
    base["backtest"] = {
        "status": "ready",
        "holdoutStart": holdout_start,
        "holdoutEnd": latest_date,
        "trades": trades[-500:],
        "tradeCount": len(trades),
        "grossPnlInr": round(gross, 2),
        "estimatedCostsInr": round(costs, 2),
        "netPnlInr": round(net, 2),
        "commonMoveProxyPnlInr": round(common_move_proxy, 2),
        "netAfterCommonMoveProxyInr": round(excess, 2),
        "winRatePct": round(sum(trade["netPnlInr"] > 0 for trade in trades) / len(trades) * 100, 2) if trades else None,
        "averageHoldSessions": round(sum(trade["holdSessions"] for trade in trades) / len(trades), 2) if trades else None,
        "message": "No qualified walk-forward trades were generated." if not trades else "Expiry-matched, cost-aware, one-lot-balanced walk-forward results; only the latest 500 trades are listed.",
    }
    return base
