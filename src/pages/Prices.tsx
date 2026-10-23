import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Scale, ArrowRight } from 'lucide-react';
import { getPrices, getContracts, getSpreads } from '../lib/api';
import { PricePoint, Contract, ContractSymbol, SpreadPoint } from '../lib/types';
import { MOCK_PAIRS } from '../mock/spreads';
import { ChartCard } from '../components/ui/ChartCard';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';

export const Prices: React.FC = () => {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [spreads, setSpreads] = useState<SpreadPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<30 | 60 | 120>(60);
  const [selectedPair, setSelectedPair] = useState('GOLDGUINEA / GOLDPETAL');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pRes, cRes, sRes] = await Promise.all([getPrices(), getContracts(), getSpreads()]);
      setPrices(pRes);
      setContracts(cRes);
      setSpreads(sRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price series');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="260px" height="32px" />
        <Skeleton variant="card" height="130px" />
        <Skeleton variant="card" height="380px" />
        <Skeleton variant="card" height="240px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load normalized prices"
        message={error}
        onRetry={loadData}
      />
    );
  }

  // Pivot prices by date so Recharts can plot all 4 lines easily
  const uniqueDates = Array.from(new Set(prices.map((p) => p.date))).sort();
  const filteredDates = uniqueDates.slice(-selectedTimeframe);
  const formatDisplayDate = (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Unavailable';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${date}T00:00:00Z`));
  };

  const chartData = filteredDates.map((date) => {
    const dayPoints = prices.filter((p) => p.date === date);
    const pointFor = (symbol: ContractSymbol) => dayPoints.find((p) => p.symbol === symbol);
    const goldM = pointFor('GOLDM');
    const goldTen = pointFor('GOLDTEN');
    const goldGuinea = pointFor('GOLDGUINEA');
    const goldPetal = pointFor('GOLDPETAL');

    return {
      date,
      GOLDM: goldM?.pricePerGram999 ?? null,
      GOLDMExpiry: goldM?.expiryDate ?? 'Unavailable',
      GOLDTEN: goldTen?.pricePerGram999 ?? null,
      GOLDTENExpiry: goldTen?.expiryDate ?? 'Unavailable',
      GOLDGUINEA: goldGuinea?.pricePerGram999 ?? null,
      GOLDGUINEAExpiry: goldGuinea?.expiryDate ?? 'Unavailable',
      GOLDPETAL: goldPetal?.pricePerGram999 ?? null,
      GOLDPETALExpiry: goldPetal?.expiryDate ?? 'Unavailable'
    };
  });

  const latestDate = uniqueDates[uniqueDates.length - 1];
  const latestPoints = prices.filter((p) => p.date === latestDate);
  const goldMPrice = latestPoints.find((p) => p.symbol === 'GOLDM')?.pricePerGram999;

  interface ComparisonRow {
    symbol: string;
    contractName: string;
    expiryDate: string | null;
    quotedSettle: number | null;
    quoteUnit: string;
    purity: number;
    normalizedPrice999: number | null;
    diffFromBenchmarkInr: number | null;
    diffBps: number | null;
  }

  const comparisonRows: ComparisonRow[] = contracts.map((c) => {
    const pt = latestPoints.find((p) => p.symbol === c.symbol);
    const norm = pt?.pricePerGram999 ?? null;
    const diff = norm !== null && goldMPrice !== undefined
      ? Math.round((norm - goldMPrice) * 100) / 100
      : null;
    const diffBps = norm !== null && goldMPrice
      ? Math.round(((norm - goldMPrice) / goldMPrice) * 10000 * 10) / 10
      : null;

    return {
      symbol: c.symbol,
      contractName: c.name,
      expiryDate: pt?.expiryDate ?? null,
      quotedSettle: pt?.settlePrice ?? null,
      quoteUnit: `per ${c.quoteBaseGrams}g`,
      purity: c.purity,
      normalizedPrice999: norm,
      diffFromBenchmarkInr: diff,
      diffBps
    };
  });

  const selectedSpreads = spreads
    .filter((point) => point.pair === selectedPair)
    .slice(-selectedTimeframe);
  const latestSpread = selectedSpreads[selectedSpreads.length - 1];
  const medianBps = latestSpread?.medianBps ?? 0;
  const costBandBps = latestSpread?.costBandBps ?? 0;
  const spreadMin = selectedSpreads.length
    ? Math.floor(Math.min(...selectedSpreads.map((point) => point.residualBps), medianBps - costBandBps) - 2)
    : -1;
  const spreadMax = selectedSpreads.length
    ? Math.ceil(Math.max(...selectedSpreads.map((point) => point.residualBps), medianBps + costBandBps) + 2)
    : 1;

  const dateRange = filteredDates.length
    ? `${formatDisplayDate(filteredDates[0])} – ${formatDisplayDate(filteredDates[filteredDates.length - 1])}`
    : 'No sessions available';

  const columns: Column<ComparisonRow>[] = [
    {
      key: 'symbol',
      header: 'Contract',
      render: (r) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white block">{r.symbol}</span>
          <span className="text-xs text-slate-500">{r.contractName}</span>
        </div>
      )
    },
    {
      key: 'expiryDate',
      header: 'Sample Contract Expiry',
      render: (r) => r.expiryDate ? formatDisplayDate(r.expiryDate) : <span className="text-slate-400">No quote</span>
    },
    {
      key: 'quotedSettle',
      header: 'Sample Settlement',
      render: (r) => (
        <span className="tabular-nums">
          {r.quotedSettle === null
            ? <span className="text-slate-400">No quote</span>
            : <>₹{r.quotedSettle.toLocaleString('en-IN')} <span className="text-xs text-slate-500">({r.quoteUnit})</span></>}
        </span>
      )
    },
    {
      key: 'purity',
      header: 'Contract Purity',
      render: (r) => (
        <span className="font-mono text-sm font-semibold tabular-nums">
          {(r.purity * 1000).toFixed(0)} fineness
        </span>
      )
    },
    {
      key: 'normalizedPrice999',
      header: 'Normalised 999 Settle',
      align: 'right',
      render: (r) => (
        r.normalizedPrice999 === null
          ? <span className="text-slate-400">No quote</span>
          : <span className="font-mono font-bold text-[#9A7135] dark:text-[#D3B477] text-base tabular-nums">
              ₹{r.normalizedPrice999.toFixed(2)}/g
            </span>
      )
    },
    {
      key: 'diffFromBenchmarkInr',
      header: 'Unadjusted Diff vs GOLDM (₹/g)',
      align: 'right',
      render: (r) =>
        r.symbol === 'GOLDM' ? (
          <span className="text-xs uppercase font-extrabold text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-500/20">
            Benchmark
          </span>
        ) : (
          <span
            className={`font-mono font-bold tabular-nums ${
              r.diffFromBenchmarkInr !== null && r.diffFromBenchmarkInr > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {r.diffFromBenchmarkInr === null
              ? 'Unavailable'
              : r.diffFromBenchmarkInr > 0 ? `+₹${r.diffFromBenchmarkInr}` : `₹${r.diffFromBenchmarkInr}`}
          </span>
        )
    },
    {
      key: 'diffBps',
      header: 'Basis Point Disparity',
      align: 'right',
      render: (r) =>
        r.symbol === 'GOLDM' ? (
          <span className="text-xs text-slate-400 font-mono">0.0 bps</span>
        ) : (
          <span
            className={`font-mono font-bold tabular-nums ${
              r.diffBps !== null && r.diffBps > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {r.diffBps === null ? 'Unavailable' : `${r.diffBps > 0 ? '+' : ''}${r.diffBps} bps`}
          </span>
        )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Normalised 999 Fine Gold Prices
          </h1>
          <Badge variant="demo">Demo data - not market data</Badge>
        </div>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
          Eliminating the optical illusion of contract differences by standardizing all 4 futures to INR per gram (99.9% fine purity).
        </p>
      </div>

      {/* Methodology Callout Card */}
      <Card variant="highlight" className="border-l-4 border-l-blue-500">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
            <Scale size={24} />
          </div>
          <div className="space-y-1.5 text-sm sm:text-base">
            <h3 className="font-bold text-slate-900 dark:text-white">
              The Fundamental Normalization Equation
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              MCX GOLDM futures are traded on a <strong>995 purity basis</strong> (99.5% pure gold), whereas GOLDTEN, GOLDGUINEA, and GOLDPETAL are traded on a <strong>999 purity basis</strong> (99.9% pure gold).
            </p>
            <div className="p-3 bg-white/80 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-blue-950 dark:text-amber-300">
              <code>
                Normalized Price(GOLDM) = (Settle / 10) × (999 / 995) = (Settle / 10) × 1.004020
              </code>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This removes the purity-basis difference only; it does not adjust for expiry, carry, execution costs, or contract-specific premiums.
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive Normalized Price Chart */}
      <ChartCard
        title="4-Contract Normalized Price Trajectory"
        subtitle={`${filteredDates.length} trading sessions · ${dateRange} · normalized settlement in INR per 999-fine gram.`}
        termKey="fine-gold"
        controls={
          <div
            role="group"
            aria-label="Price chart history"
            className="flex items-center gap-1 backdrop-blur-md bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-300/60 dark:border-white/10"
          >
            {([30, 60, 120] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                aria-pressed={selectedTimeframe === tf}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf} sessions
              </button>
            ))}
          </div>
        }
        footerNote="All four lines show normalized sample settlements. Contract expiries appear in each tooltip; price differences remain unadjusted for carry, expiry, fees, or execution."
      >
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13 }}
                tickFormatter={(val: string) => val.slice(5)}
                stroke="#888888"
              />
              <YAxis
                tick={{ fontSize: 13 }}
                stroke="#888888"
                domain={['dataMin - 15', 'dataMax + 15']}
                tickFormatter={(v) => `₹${v}`}
                label={{
                  value: 'INR / 999-fine gram',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#64748B', fontSize: 12 }
                }}
              />
              <RechartsTooltip
                labelFormatter={(label) => `Settlement date: ${formatDisplayDate(String(label))}`}
                formatter={(value, _name, item) => {
                  const symbol = String(item.dataKey);
                  const expiry = item.payload[`${symbol}Expiry`] ?? 'Unavailable';
                  return [
                    `₹${Number(value).toFixed(2)}/g · expiry ${formatDisplayDate(String(expiry))}`,
                    symbol
                  ];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(14, 22, 40, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="GOLDM"
                name="GOLDM · benchmark"
                stroke="#9A7135"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="GOLDTEN"
                name="GOLDTEN"
                stroke="#B08D57"
                strokeWidth={2.2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="GOLDGUINEA"
                name="GOLDGUINEA"
                stroke="#C49A45"
                strokeDasharray="4 4"
                strokeWidth={2.2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="GOLDPETAL"
                name="GOLDPETAL"
                stroke="#7F6843"
                strokeDasharray="2 2"
                strokeWidth={2.2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title={`Pair Relative-Deviation Preview: ${selectedPair}`}
        subtitle={`Illustrative residual series · ${selectedSpreads.length} sessions · ${selectedSpreads.length ? `${formatDisplayDate(selectedSpreads[0].date)} – ${formatDisplayDate(selectedSpreads[selectedSpreads.length - 1].date)}` : 'No sample sessions available'} · values in basis points.`}
        controls={
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Pair</span>
            <select
              aria-label="Choose contract pair for relative-deviation preview"
              value={selectedPair}
              onChange={(event) => setSelectedPair(event.target.value)}
              className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {MOCK_PAIRS.map((pair) => <option key={pair} value={pair}>{pair}</option>)}
            </select>
          </label>
        }
        footerNote="This synthetic residual preview is not a live or verified carry-adjusted spread. The red band represents a sample cost hurdle, not an executable quote or recommendation."
      >
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedSpreads} margin={{ top: 10, right: 18, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => value.slice(5)}
                stroke="#888888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888888"
                domain={[spreadMin, spreadMax]}
                label={{
                  value: 'Residual (bps)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#64748B', fontSize: 12 }
                }}
              />
              <RechartsTooltip
                labelFormatter={(label) => `Session: ${formatDisplayDate(String(label))}`}
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)} bps`,
                  name === 'residualBps' ? 'Residual spread' : 'Equilibrium median'
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(14, 22, 40, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <ReferenceArea
                y1={medianBps - costBandBps}
                y2={medianBps + costBandBps}
                fill="#DC2626"
                fillOpacity={0.07}
                ifOverflow="extendDomain"
              />
              <ReferenceLine
                y={medianBps}
                stroke="#64748B"
                strokeDasharray="5 5"
                label={{ value: 'Sample median', fill: '#64748B', fontSize: 11, position: 'insideTopLeft' }}
              />
              <ReferenceLine y={medianBps + costBandBps} stroke="#DC2626" strokeDasharray="3 3" />
              <ReferenceLine y={medianBps - costBandBps} stroke="#DC2626" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="residualBps"
                name="residualBps"
                stroke="#0D9488"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Sample expiry pair: {latestSpread?.expiryPair ?? 'Unavailable'}</span>
          <Link
            to={`/spreads?pair=${encodeURIComponent(selectedPair)}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Open spread analysis <ArrowRight size={14} />
          </Link>
        </div>
      </ChartCard>

      {/* Comparative Spread Table */}
      <section aria-labelledby="comparison-heading" className="space-y-3">
        <h2 id="comparison-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Latest Sample Settlements & Unadjusted Differences
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The GOLDM comparison is a raw normalized price difference—not a carry-adjusted spread or trade signal. Values use each sample row&apos;s own contract expiry.
        </p>
        <DataTable
          data={comparisonRows}
          columns={columns}
          keyExtractor={(r) => r.symbol}
          caption="Latest sample settlement, contract expiry, and unadjusted normalized price comparison"
        />
      </section>
    </div>
  );
};
