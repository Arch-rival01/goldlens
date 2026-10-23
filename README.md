# GoldLens

GoldLens is a React/TypeScript frontend and Python API prototype for research on MCX gold futures. The Backtest page imports public MCX bhavcopy CSV/ZIP files, validates the published fields, stores expiry-specific settlements in SQLite, and presents expiry-matched cross-contract research, term structure, lifecycle guardrails, and walk-forward results. Other dashboard screens still contain clearly identified sample/demo data and are not connected to the new settlement store.

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- Python 3.11+

## Run locally

Install frontend dependencies and start Vite:

```sh
npm ci
npm run dev
```

In another terminal, install and start the API from the workspace root:

```sh
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Vite proxies `/api` to the local API. Use MCX's public [Bhavcopy](https://www.mcxindia.com/market-data/bhavcopy) or [Historical Data](https://www.mcxindia.com/market-data/historical-data) pages as the source, then upload a CSV or ZIP report on the Backtest page. The importer accepts the documented normalized fields and the Historical Data detail-report aliases (`Commodity`, `Expiry Date`, `Vol (Lots)`, and `OI (Lots)`); non-FUTCOM instrument rows are rejected. SQLite data is stored under `backend/data/` by default; set `GOLDLENS_DATA_DIR` to a persistent writable directory to change that location. An optional expected date on upload uses DD/MM/YYYY and is checked against every returned MCX Date.

Run backend tests and frontend checks:

```sh
python -m unittest backend.test_app
npm run lint
npm run build
```

The production frontend bundle is written to `dist/`.

## Research prototype methodology

- The API accepts the documented `Symbol`, `Date`, `ExpiryDate`, OHLC, `Volume`, and `OpenInterest` fields. It strips padded symbol values, parses MCX response dates as MM/DD/YYYY and compact expiries such as `04SEP2026`, rejects invalid OHLC and date rows, and never fills in a requested-date mismatch with a newer result.
- Contract normalization uses GOLDM 100 g / 10 g quote / 995 purity, GOLDTEN 10 g / 10 g / 999, GOLDGUINEA 8 g / 8 g / 999, and GOLDPETAL 1 g / 1 g / 999. GOLDTEN records dated before 2025 are rejected; the exact listing date should be confirmed from official contract records.
- Contracts remain grouped by `(symbol, expiry_date)`; there is no synthetic continuous near-month series. Pair observations require both contracts to have a quote on the same date and share the exact expiry.
- Each leg's settlement is normalized to INR per gram of 999-fine gold. The relative-value residual is the log price ratio in basis points. A fixed trailing 20-paired-session z-score enters at ±2; it exits on mean crossing, after five paired sessions, or within five calendar days of expiry. Today's signal uses only prior observations.
- Each spread is sized in integer lots (at most 100 per leg), with gross leg notionals within 5%. Entries require each reported daily volume to be at least 20 times the proposed lots (a maximum 5% volume participation proxy), sufficient expiry runway, and modeled edge greater than the assumed round-trip costs. This volume screen is not market depth.
- The trader-facing panel emits only latest-date candidates that were actually eligible to enter in the walk-forward replay; if no candidate clears every gate, it shows a quiet state. Candidate edge assumes both normalized leg prices move symmetrically until the trailing spread mean.
- The latest 30% of distinct dates is the chronological walk-forward holdout; at least 60 dates are reserved for evaluation, and at least 200 dates are required overall. The strategy blocks overlapping positions that share a contract/expiry and does not retune parameters in the holdout.
- Holdout P&L uses both actually held contracts' own entry/exit settlement marks and their integer lot quantities. The user-selected cost in basis points is charged against average combined entry/exit leg notional. It is an explicit stress assumption—not measured bid/ask, statutory fees, or an executable fill model.
- Strategy attribution subtracts an approximate common-move proxy derived from the two held legs, not an independent spot-gold series. It should not be interpreted as verified gold beta or market-neutral performance. Results are summed spread outcomes, not a capital-scaled portfolio return.
- Term-structure carry compares adjacent listed expiries. Roll-down is an interpolation of the prior session's observed curve as tenor decays by calendar days; the residual same-expiry move is labeled curve re-mark. A calculation is omitted when the curve cannot bracket the target tenor.
- The lifecycle gate uses a five-calendar-day expiry safety buffer. Bhavcopy does not contain official tender commencement/listing notices, so the app does not fabricate those dates or claim to enforce official tender rules.
- Lifecycle "first observed" and rolling-median volume fields are calculated only from imported files; first observation is not the official listing date, and reported volume is not executable depth.
- Fewer than 200 distinct dates is reported as insufficient data. No sample backtest figures are presented as historical results. An empty signal panel is an intended outcome when no candidate clears all gates.

This is an exploratory research tool, not a trading recommendation. Settlement data alone cannot establish executable performance; volume is not order-book depth.

## Deploy

The frontend can be hosted statically with build command `npm run build`, output directory `dist`, and an SPA fallback to `/index.html`. The Python API must also be deployed as a separate service, with `/api` reverse-proxied to it over HTTPS. Set `GOLDLENS_DATA_DIR` to durable storage and `GOLDLENS_CORS_ORIGINS` to the exact frontend origin(s). Do not expose the unauthenticated upload API to the public internet: put it behind authentication and upload quotas before public deployment. Provider-specific configuration is omitted because no host has been selected.

The frontend does not read `GEMINI_API_KEY`. If a Gemini-backed server is added later, configure that key as a server-side secret, never as a browser-visible `VITE_*` variable.
