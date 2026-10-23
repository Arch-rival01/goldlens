import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Bookmark, BookmarkCheck, GitCompare, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getSpreads } from '../lib/api';
import { SpreadPoint } from '../lib/types';
import { MOCK_PAIRS } from '../mock/spreads';
import { ChartCard } from '../components/ui/ChartCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';
import { useUser } from '../lib/auth';
import { toast } from '../components/ui/Toast';

export const Spreads: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPair = searchParams.get('pair') || 'GOLDM / GOLDPETAL';
  const [selectedPair, setSelectedPair] = useState<string>(initialPair);
  const [spreads, setSpreads] = useState<SpreadPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'bps' | 'zscore'>('bps');

  const { user, toggleFollowPair } = useUser();

  const isFollowed = user?.followedPairs.includes(selectedPair) ?? false;

  const loadData = async (pair: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSpreads(pair);
      setSpreads(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load spread dataset');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedPair);
  }, [selectedPair]);

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    setSearchParams({ pair });
  };

  const handleFollowClick = () => {
    if (!user) return;
    const added = toggleFollowPair(selectedPair);
    if (added) {
      toast.success(`Now tracking ${selectedPair} for alerts.`, 'Pair Followed');
    } else {
      toast.info(`Removed ${selectedPair} from watch list.`, 'Pair Unfollowed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="220px" height="32px" />
          <Skeleton variant="text" width="140px" height="24px" />
        </div>
        <Skeleton variant="rectangular" height="50px" />
        <Skeleton variant="card" height="360px" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load spread series"
        message={error}
        onRetry={() => loadData(selectedPair)}
      />
    );
  }

  const latest = spreads[spreads.length - 1];
  const costBand = latest?.costBandBps || 10;
  const median = latest?.medianBps || 0;

  const tableColumns: Column<SpreadPoint>[] = [
    { key: 'date', header: 'Date' },
    { key: 'expiryPair', header: 'Tenor Pair' },
    {
      key: 'residualBps',
      header: 'Residual Spread',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold tabular-nums">
          {row.residualBps > 0 ? `+${row.residualBps}` : row.residualBps} bps
        </span>
      )
    },
    {
      key: 'zScore',
      header: 'Z-Score (Sigma)',
      align: 'right',
      render: (row) => (
        <span
          className={`font-mono font-bold tabular-nums ${
            Math.abs(row.zScore) >= 2.0
              ? 'text-amber-500'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {row.zScore > 0 ? `+${row.zScore}` : row.zScore}σ
        </span>
      )
    },
    {
      key: 'costBandBps',
      header: 'Cost Hurdle',
      align: 'right',
      render: (row) => (
        <span className="text-rose-500 dark:text-rose-400 font-mono text-xs font-semibold tabular-nums">
          ±{row.costBandBps} bps
        </span>
      )
    },
    {
      key: 'alertFired',
      header: 'Sample Alert Outcome',
      align: 'center',
      render: (row) =>
        row.alertFired ? (
          <Badge variant="warning" size="sm">
            Sample Alert
          </Badge>
        ) : (
          <span className="text-xs text-slate-500 font-medium">No sample alert</span>
        )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Spread Monitor & Mean Reversion
            </h1>
            <Badge variant="demo">Synthetic demo</Badge>
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
            Synthetic examples of residual basis points, cost hurdles, and Z-scores; no live spread computation is connected.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant={isFollowed ? 'teal' : 'outline'}
              onClick={handleFollowClick}
              icon={isFollowed ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            >
              {isFollowed ? 'Following Pair' : 'Follow This Pair'}
            </Button>
          </div>
        )}
      </div>

      {/* Pair Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {MOCK_PAIRS.map((pair) => {
          const isActive = pair === selectedPair;
          return (
            <button
              key={pair}
              onClick={() => handlePairChange(pair)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 min-h-[44px] flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'morphic-btn-primary font-bold shadow-[0_4px_16px_rgba(245,158,11,0.45)]'
                  : 'backdrop-blur-md bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs'
              }`}
            >
              <GitCompare size={16} />
              <span>{pair}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Sample Z-Score"
          value={`${latest?.zScore ?? 0}σ`}
          subtext={
            Math.abs(latest?.zScore ?? 0) < 1.5
              ? 'Calm inside ±1.5σ band'
              : 'Dislocation alert'
          }
          termKey="z-score"
          variant={Math.abs(latest?.zScore ?? 0) >= 2.0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Residual Spread"
          value={`${latest?.residualBps ?? 0} bps`}
          subtext={`30-day median: ${median} bps`}
          termKey="basis-point"
        />
        <StatCard
          label="Round-Trip Cost Hurdle"
          value={`±${costBand} bps`}
          subtext="CTT + Stamp + Bid-Ask Spread"
          termKey="slippage"
        />
        <StatCard
          label="Sample Half-Life"
          value="4.8 days"
          subtext="Illustrative model field"
          termKey="half-life"
        />
      </div>

      {/* Spread Time Series Chart */}
      <ChartCard
        title={`Spread Evolution: ${selectedPair}`}
        subtitle={`${spreads.length} illustrative sessions. Residual = teal; equilibrium median = dashed; sample cost hurdle = red.`}
        ariaLabel="Interactive spread time series chart"
        controls={
          <div className="flex items-center gap-1 backdrop-blur-md bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-300/60 dark:border-white/10">
            <button
              onClick={() => setChartMetric('bps')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartMetric === 'bps'
                  ? 'morphic-btn-primary shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Basis Points (bps)
            </button>
            <button
              onClick={() => setChartMetric('zscore')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartMetric === 'zscore'
                  ? 'morphic-btn-primary shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Z-Score (Sigma)
            </button>
          </div>
        }
        footerNote="Note: Grey dotted bands depict the bidirectional transaction cost hurdle. Dislocation spikes only trigger alerts when crossing beyond cost hurdles."
      >
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={spreads}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13 }}
                tickFormatter={(val) => val.slice(5)}
                stroke="#888888"
              />
              <YAxis
                tick={{ fontSize: 13 }}
                stroke="#888888"
                domain={
                  chartMetric === 'bps'
                    ? [Math.floor(median - costBand - 8), Math.ceil(median + costBand + 8)]
                    : [-3.5, 3.5]
                }
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(14, 22, 40, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderRadius: '1rem',
                  fontSize: '13px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              />
              {chartMetric === 'bps' ? (
                <>
                  <ReferenceLine
                    y={median}
                    stroke="#64748B"
                    strokeDasharray="5 5"
                    strokeWidth={1.8}
                    label={{ value: 'Median Equilibrium', fill: '#64748B', fontSize: 13, position: 'right' }}
                  />
                  <ReferenceLine
                    y={median + costBand}
                    stroke="#DC2626"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{ value: `+${costBand} bps Hurdle`, fill: '#DC2626', fontSize: 13, position: 'insideTopLeft' }}
                  />
                  <ReferenceLine
                    y={median - costBand}
                    stroke="#DC2626"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{ value: `-${costBand} bps Hurdle`, fill: '#DC2626', fontSize: 13, position: 'insideBottomLeft' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="residualBps"
                    name="Residual (bps)"
                    stroke="#0D9488"
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{ r: 6, fill: '#0D9488' }}
                  />
                </>
              ) : (
                <>
                  <ReferenceLine y={0} stroke="#64748B" strokeWidth={1} />
                  <ReferenceLine
                    y={2.0}
                    stroke="#DC2626"
                    strokeDasharray="4 4"
                    label={{ value: '+2.0σ Threshold', fill: '#DC2626', fontSize: 13 }}
                  />
                  <ReferenceLine
                    y={-2.0}
                    stroke="#DC2626"
                    strokeDasharray="4 4"
                    label={{ value: '-2.0σ Threshold', fill: '#DC2626', fontSize: 13 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="zScore"
                    name="Z-Score (σ)"
                    stroke="#0D9488"
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{ r: 6, fill: '#0D9488' }}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Observations Table */}
      <section aria-labelledby="observations-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="observations-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Daily Observations Log (Last 12 Sessions)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Auto-collapses to stacked cards on mobile</span>
        </div>

        <DataTable
          data={spreads.slice(-12).reverse()}
          columns={tableColumns}
          keyExtractor={(row) => `${row.date}-${row.pair}`}
          caption="Spread daily history"
        />
      </section>

    </div>
  );
};
