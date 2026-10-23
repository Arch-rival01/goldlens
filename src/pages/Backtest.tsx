import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Database, FileUp, RefreshCw, ShieldCheck } from 'lucide-react';
import { getResearch, uploadBhavcopy } from '../lib/api';
import { BhavcopyUploadResult, ResearchReport, ResearchTrade } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

function formatDate(value: string | null): string {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    : '—';
}

function formatIndianRequestedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function Metric({ label, value, detail, negative }: {
  label: string;
  value: string;
  detail?: string;
  negative?: boolean;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-bold tabular-nums ${negative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>}
    </Card>
  );
}

function TradesTable({ trades }: { trades: ResearchTrade[] }) {
  if (!trades.length) {
    return <p className="p-5 text-sm text-slate-600 dark:text-slate-300">No qualifying trades occurred in the holdout period.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <caption className="sr-only">Expiry-matched strategy trades in the chronological holdout period</caption>
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Matched pair / expiry</th>
            <th className="px-4 py-3">Legs (lots)</th>
            <th className="px-4 py-3">Entry → exit</th>
            <th className="px-4 py-3 text-right">Settlement marks (₹ / quote base)</th>
            <th className="px-4 py-3 text-right">Hold</th>
            <th className="px-4 py-3 text-right">Gross P&amp;L</th>
            <th className="px-4 py-3 text-right">Cost estimate</th>
            <th className="px-4 py-3 text-right">Net P&amp;L</th>
            <th className="px-4 py-3 text-right">Net after common-move proxy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {trades.map((trade) => (
            <tr key={`${trade.pair}-${trade.expiryDate}-${trade.entryDate}`}>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-white">
                {trade.pair}<span className="block text-xs font-normal text-slate-500">Expiry {formatDate(trade.expiryDate)}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs">
                <span className="block">{trade.sideA} {trade.lotsA} × {trade.symbolA}</span>
                <span className="block">{trade.sideB} {trade.lotsB} × {trade.symbolB}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                {formatDate(trade.entryDate)} → {formatDate(trade.exitDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-slate-700 dark:text-slate-300">
                <span className="block">{currency.format(trade.entryPriceA)} / {trade.quoteBaseGramsA}g → {currency.format(trade.exitPriceA)} / {trade.quoteBaseGramsA}g</span>
                <span className="block">{currency.format(trade.entryPriceB)} / {trade.quoteBaseGramsB}g → {currency.format(trade.exitPriceB)} / {trade.quoteBaseGramsB}g</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{trade.holdSessions} sessions</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{currency.format(trade.grossPnlInr)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-700 dark:text-amber-400">{currency.format(trade.estimatedCostsInr)}</td>
              <td className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${trade.netPnlInr < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {currency.format(trade.netPnlInr)}
              </td>
              <td className={`px-4 py-3 text-right font-mono tabular-nums ${trade.netAfterCommonMoveProxyInr < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {currency.format(trade.netAfterCommonMoveProxyInr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Backtest: React.FC = () => {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [requestedDate, setRequestedDate] = useState('');
  const [roundTripCost, setRoundTripCost] = useState(20);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BhavcopyUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReport = useCallback(async (costBps: number) => {
    setIsLoading(true);
    setError(null);
    try {
      setReport(await getResearch(costBps));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not connect to the research API');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport(20);
  }, [loadReport]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    try {
      const result = await uploadBhavcopy(
        selectedFile,
        requestedDate ? formatIndianRequestedDate(requestedDate) : undefined
      );
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadReport(roundTripCost);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not import the selected file');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading && !report) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="320px" height="32px" />
        <Skeleton variant="card" height="160px" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton variant="card" height="110px" />
          <Skeleton variant="card" height="110px" />
          <Skeleton variant="card" height="110px" />
          <Skeleton variant="card" height="110px" />
        </div>
      </div>
    );
  }

  if (error && !report) {
    return <ErrorState title="Research API unavailable" message={`${error}. Start the backend with the documented command and retry.`} onRetry={() => void loadReport(roundTripCost)} />;
  }

  const backtest = report?.backtest;
  const coverage = report?.coverage;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">MCX Settlement Research</h1>
          <Badge variant={backtest?.status === 'ready' ? 'success' : 'demo'}>
            {backtest?.status === 'ready' ? 'Historical holdout' : 'No strategy claims'}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Import official MCX bhavcopy files to analyze matched expiry spreads, term structure, and walk-forward evidence. No exchange feed or account connection is assumed.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" size={20} />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-white">Import MCX bhavcopy</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Use the official MCX{' '}
              <a
                href="https://www.mcxindia.com/market-data/bhavcopy"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-700 underline underline-offset-2 dark:text-blue-300"
              >
                Bhavcopy page
              </a>
              {' '}or{' '}
              <a
                href="https://www.mcxindia.com/market-data/historical-data"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-700 underline underline-offset-2 dark:text-blue-300"
              >
                Historical Data
              </a>
              {' '}page to obtain daily settlement data, and confirm unit/purity details on{' '}
              <a
                href="https://www.mcxindia.com/products/bullion/gold"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-700 underline underline-offset-2 dark:text-blue-300"
              >
                MCX Gold specifications
              </a>
              . Upload a CSV or ZIP report. The importer accepts the normalized field names and MCX detail-report aliases; files stay on this backend in its local SQLite database.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Bhavcopy file
                <input
                  type="file"
                  accept=".csv,.zip,text/csv,application/zip"
                  ref={fileInputRef}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Expected date (optional, one-day file)
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(event) => setRequestedDate(event.target.value)}
                  className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <Button onClick={() => void handleUpload()} disabled={!selectedFile || isUploading} icon={<FileUp size={16} />}>
                {isUploading ? 'Importing…' : 'Import file'}
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Optional expected date is checked against each returned MCX Date. A mismatch is rejected instead of accepting a fallback day. Futures-only data is accepted; options are rejected. Uploads are limited to 20 MB.
            </p>
          </div>
        </div>
      </Card>

      {(error || uploadResult) && (
        <div role={error ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm ${error ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200' : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
          {error ? (
            <div className="flex items-start gap-2"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>{error}</p></div>
          ) : uploadResult && (
            <>
              <p className="font-semibold">{uploadResult.rowsLoaded} rows imported from {uploadResult.filename}; {uploadResult.rowsRejected} rejected. Date check: {uploadResult.dateValidation}.</p>
              {uploadResult.rejected.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {uploadResult.rejected.slice(0, 5).map((item, index) => <li key={`${item.file}-${item.line}-${index}`}>{item.file}, line {item.line}: {item.reason}</li>)}
                  {uploadResult.truncatedRejections > 0 && <li>{uploadResult.truncatedRejections} additional rejected rows omitted.</li>}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {isLoading && report && <p role="status" className="text-sm text-slate-500">Recalculating the holdout report…</p>}

      {report && coverage && backtest && (
        <>
          <section aria-labelledby="signals-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="signals-heading" className="text-lg font-bold text-slate-900 dark:text-white">Latest research signals</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Signals require a same-date, same-expiry pair and must clear all cost, lot-size, volume-participation, and expiry gates.</p>
              </div>
              <Badge variant={report.currentSignals.length > 0 ? 'success' : 'neutral'}>
                {report.currentSignals.length > 0 ? `${report.currentSignals.length} gate-cleared` : 'Quiet'}
              </Badge>
            </div>
            {report.currentSignals.length === 0 ? (
              <Card className="p-5 text-sm text-slate-600 dark:text-slate-300">
                {report.quietReason || 'No actionable signal on the latest date. GoldLens stays quiet when no candidate clears its gates.'}
              </Card>
            ) : report.currentSignals.map((signal) => (
              <Card key={`${signal.pair}-${signal.expiryDate}`} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{signal.pair} · expiry {formatDate(signal.expiryDate)}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {signal.sideA} {signal.lotsA} × {signal.symbolA}; {signal.sideB} {signal.lotsB} × {signal.symbolB} · residual {signal.residualBps.toFixed(1)} bps · z = {signal.zScore.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-slate-500">Expected after assumed costs</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{currency.format(signal.expectedNetPnlInr)}</p>
                    <p className="text-xs text-slate-500">{signal.expectedNetEdgeBps.toFixed(1)} bps · {signal.daysToExpiry} days to expiry</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-3">
                  {signal.gates.map((gate) => (
                    <li key={gate.name} className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <span className="font-semibold">Passed · {gate.name}</span>
                      <span className="mt-0.5 block">{gate.detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </section>

          <section aria-labelledby="curve-heading" className="space-y-3">
            <div>
              <h2 id="curve-heading" className="text-lg font-bold text-slate-900 dark:text-white">Term structure & carry</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Latest available expiry curves, normalized to 999-fine INR per gram. Carry compares adjacent listed expiries and is annualized by their calendar-tenor gap.</p>
            </div>
            {report.curve.length === 0 ? (
              <Card className="p-4 text-sm text-slate-500">No symbol has multiple listed expiries on the latest data date.</Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Contract</th><th className="px-4 py-3">Near → far expiry</th>
                        <th className="px-4 py-3 text-right">999 fine ₹/g</th><th className="px-4 py-3 text-right">Annualized carry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {report.curve.map((point) => (
                        <tr key={`${point.symbol}-${point.nearExpiry}-${point.farExpiry}`}>
                          <td className="px-4 py-3 font-semibold">{point.symbol}</td>
                          <td className="px-4 py-3">{formatDate(point.nearExpiry)} → {formatDate(point.farExpiry)} <span className="text-xs text-slate-500">({point.nearDaysToExpiry}d → {point.farDaysToExpiry}d)</span></td>
                          <td className="px-4 py-3 text-right font-mono">{point.nearPricePerGram999.toFixed(2)} → {point.farPricePerGram999.toFixed(2)}</td>
                          <td className={`px-4 py-3 text-right font-mono ${point.annualizedCarryPct < 0 ? 'text-rose-600 dark:text-rose-400' : ''}`}>{point.annualizedCarryPct.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Roll-down vs curve re-mark</h3>
              <p className="mt-1 text-xs text-slate-500">Roll-down is estimated from the prior session’s cross-expiry curve as tenor decays by calendar days. Genuine curve change is the same-expiry observed move less that estimate; values are per 999-fine gram.</p>
              {report.rollDown.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Insufficient adjacent expiries to interpolate a roll-down estimate.</p>
              ) : (
                <div className="mt-3 max-h-64 overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-white text-left text-slate-500 dark:bg-slate-900">
                      <tr><th className="px-2 py-2">Expiry</th><th className="px-2 py-2">Date</th><th className="px-2 py-2 text-right">Roll-down</th><th className="px-2 py-2 text-right">Observed</th><th className="px-2 py-2 text-right">Curve re-mark</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {report.rollDown.slice(-12).map((point) => (
                        <tr key={`${point.symbol}-${point.expiryDate}-${point.toDate}`}>
                          <td className="px-2 py-2">{point.symbol} · {formatDate(point.expiryDate)}</td>
                          <td className="px-2 py-2">{formatDate(point.toDate)}</td>
                          <td className="px-2 py-2 text-right font-mono">{point.rollDownInrPerGram999.toFixed(3)}</td>
                          <td className="px-2 py-2 text-right font-mono">{point.observedMoveInrPerGram999.toFixed(3)}</td>
                          <td className="px-2 py-2 text-right font-mono">{point.genuineCurveChangeInrPerGram999.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="lifecycle-heading" className="space-y-3">
            <div>
              <h2 id="lifecycle-heading" className="text-lg font-bold text-slate-900 dark:text-white">Contract lifecycle guardrail</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Expiry buffer is used because official tender commencement dates are not contained in the imported bhavcopy. It is not a substitute for exchange notices.</p>
            </div>
            <Card className="overflow-hidden">
              {report.lifecycle.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No contract expiries in the imported dataset.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                      <tr><th className="px-4 py-3">Contract / expiry</th><th className="px-4 py-3">First observed → latest quote</th><th className="px-4 py-3 text-right">Days to expiry</th><th className="px-4 py-3 text-right">Volume lots (latest / median)</th><th className="px-4 py-3">Entry gate</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {report.lifecycle.slice(0, 12).map((item) => (
                        <tr key={`${item.symbol}-${item.expiryDate}`}>
                          <td className="px-4 py-3 font-semibold">{item.symbol} · {formatDate(item.expiryDate)}</td>
                          <td className="px-4 py-3">{formatDate(item.firstObservedDate)} → {formatDate(item.asOfDate)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{item.daysToExpiry}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.latestVolumeLots.toLocaleString('en-IN')} / {item.rollingMedianVolumeLots.toLocaleString('en-IN')} <span className="text-slate-500">({item.volumeVsMedianPct === null ? '—' : `${item.volumeVsMedianPct}%`})</span></td>
                          <td className="px-4 py-3">{item.newEntriesAllowed ? 'Open (expiry buffer clear)' : 'Blocked (expiry safety buffer)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="coverage-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 id="coverage-heading" className="text-lg font-bold text-slate-900 dark:text-white">Imported dataset</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {coverage.rows.toLocaleString()} rows · {coverage.contracts} expiry-specific contracts · {coverage.sessions} dates · {formatDate(coverage.firstDate)} – {formatDate(coverage.lastDate)}
                </p>
              </div>
              <Button variant="outline" onClick={() => void loadReport(roundTripCost)} disabled={isLoading} icon={<RefreshCw size={16} />}>Refresh analysis</Button>
            </div>
            {coverage.rows === 0 ? (
              <Card className="p-5 text-sm text-slate-600 dark:text-slate-300">
                No settlement records are stored yet. Import MCX bhavcopy data above; mock prices and synthetic backtest results are not used here.
              </Card>
            ) : backtest.status === 'insufficient_data' ? (
              <Card className="p-5 text-sm text-slate-600 dark:text-slate-300">
                <p>{backtest.message}</p>
                <p className="mt-2">This minimum ensures at least 60 later dates remain in the chronological holdout; it does not by itself establish a reliable trading edge.</p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Holdout gross P&L" value={currency.format(backtest.grossPnlInr)} detail={`${backtest.tradeCount} balanced pair trades`} negative={backtest.grossPnlInr < 0} />
                  <Metric label="Assumed transaction costs" value={currency.format(backtest.estimatedCostsInr)} detail={`${report.configuration.roundTripCostBps} bps on combined leg notional`} negative />
                  <Metric label="Holdout net P&L" value={currency.format(backtest.netPnlInr)} detail={`Win rate ${backtest.winRatePct === null ? '—' : `${backtest.winRatePct}%`}`} negative={backtest.netPnlInr < 0} />
                  <Metric
                    label="Net after shared-move proxy"
                    value={currency.format(backtest.netAfterCommonMoveProxyInr)}
                    detail={`Common-move contribution ${currency.format(backtest.commonMoveProxyPnlInr)}; not an independent spot benchmark`}
                    negative={backtest.netAfterCommonMoveProxyInr < 0}
                  />
                </div>

                <Card className="mt-4 p-4 sm:p-5">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Expiry-matched cross-contract walk-forward</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{backtest.message}</p>
                      <p className="mt-1 text-xs text-slate-500">Chronological holdout: {formatDate(backtest.holdoutStart)} – {formatDate(backtest.holdoutEnd)}. Earlier history supplies only trailing signals. Positions are paired by exact expiry, whole-lot balanced, and conflicting open legs are blocked.</p>
                    </div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Assumed round-trip cost (bps)
                      <span className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="500"
                          step="1"
                          value={roundTripCost}
                          onChange={(event) => setRoundTripCost(Math.min(500, Math.max(0, Number(event.target.value))))}
                          className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <Button variant="outline" onClick={() => void loadReport(roundTripCost)} disabled={isLoading}>Apply</Button>
                      </span>
                    </label>
                  </div>
                  <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
                    This is an explicit friction assumption applied to combined entry and exit leg notional, not a measured bid/ask spread, statutory charge schedule, or executable fill.
                  </p>
                </Card>

                <Card className="mt-4 overflow-hidden">
                  <div className="border-b border-slate-200 p-4 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">Holdout trades by actual matched legs and expiry</h3>
                    <p className="mt-1 text-xs text-slate-500">P&amp;L uses both held contracts’ own settlement marks, never a continuous near-month series. Whole-lot exposure mismatch is capped at {report.configuration.maxLegNotionalImbalancePct}%; settlement values are not claimed fills.</p>
                  </div>
                  <TradesTable trades={backtest.trades} />
                </Card>
              </>
            )}
          </section>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Read this as research, not a trading record</h2>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {report.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
