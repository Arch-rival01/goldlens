import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Calendar,
  Layers,
  HeartPulse,
  Eye,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { getOverview, getPrices } from '../lib/api';
import { OverviewData, PricePoint, Alert } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';
import { useUser } from '../lib/auth';
import { MOCK_SAMPLE_ACTIVE_ALERT } from '../mock/alerts';
import { ResearchSignals } from '../components/research/ResearchSignals';

// Sparkline SVG component
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({
  data,
  color = '#9A7135'
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 120;
      const y = 36 - ((val - min) / range) * 28 - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 120 36"
      className="w-28 sm:w-32 h-9 overflow-visible"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const Overview: React.FC = () => {
  const { user, role } = useUser();
  const [data, setData] = useState<OverviewData | null>(null);
  const [allPrices, setAllPrices] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedAlertActive, setSimulatedAlertActive] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, pricesRes] = await Promise.all([getOverview(), getPrices()]);
      setData(overviewRes);
      setAllPrices(pricesRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="240px" height="32px" />
          <Skeleton variant="text" width="160px" height="24px" />
        </div>
        <Skeleton variant="card" height="140px" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" height="180px" />
          <Skeleton variant="card" height="180px" />
          <Skeleton variant="card" height="180px" />
          <Skeleton variant="card" height="180px" />
        </div>
        <Skeleton variant="rectangular" height="80px" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
          <Skeleton variant="card" height="120px" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load market overview"
        message={error || 'Unable to retrieve MCX gold futures snapshot.'}
        onRetry={fetchData}
      />
    );
  }

  // Active alerts either real or simulated for interactive demonstration
  const activeAlerts: Alert[] = simulatedAlertActive
    ? [MOCK_SAMPLE_ACTIVE_ALERT]
    : data.activeAlerts;

  const hasAlerts = activeAlerts.length > 0;

  // Compute sparkline points for each contract (last 20 daily points)
  const getSparklineForSymbol = (symbol: string) => {
    const subset = allPrices.filter((p) => p.symbol === symbol).slice(-20);
    return subset.map((p) => p.pricePerGram999);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title & Plain English Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              MCX Gold Futures Arbitrage Intelligence
            </h1>
            <Badge variant="demo">Synthetic demo</Badge>
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
            Same gold, four sample prices, one comparable 999-fine basis. Values are not live quotes or executable fills.
          </p>
        </div>

        {/* Demo Simulation Toggle */}
        <div className="self-start sm:self-auto">
          <button
            onClick={() => setSimulatedAlertActive(!simulatedAlertActive)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors min-h-[44px] shadow-sm backdrop-blur-md"
            title="Preview an illustrative sample alert"
          >
            <Sliders size={14} className="text-amber-500" />
            <span>
              {simulatedAlertActive ? 'Hide Sample Alert' : 'Preview Sample Alert'}
            </span>
          </button>
        </div>
      </div>

      <ResearchSignals />

      {/* 1. Big Status Card */}
      {!hasAlerts ? (
        <div
          role="status"
          aria-label="Illustrative demo status"
          className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 text-slate-900 dark:text-slate-100 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Info size={26} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    Sample quiet state
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Illustrative gate output
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Sample scenario: no alert is shown.
                </h2>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {data.quietReason}
                </p>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium pt-1 flex items-center gap-1.5">
                  <Info size={16} />
                  <span>
                    The alert logic shown here is illustrative and has not been evaluated against a live exchange feed.
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 self-start md:self-center">
              <Link to="/spreads">
                <Button variant="teal" icon={<ArrowRight size={18} />} iconPosition="right">
                  Inspect Spreads
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              role="alert"
              className="rounded-2xl bg-blue-50/70 dark:bg-blue-400/5 border border-blue-200 dark:border-blue-400/20 p-6 sm:p-7 text-slate-900 dark:text-slate-100 relative overflow-hidden"
            >
              {/* Specular highlight top shine */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                 <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl morphic-btn-primary flex items-center justify-center shrink-0">
                    <AlertTriangle size={30} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-xs uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200 border border-blue-200 dark:border-blue-400/20">
                        Sample Relative-Value Alert
                      </span>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold">
                        {alert.id}
                      </span>
                      <Badge variant="success" size="sm">
                        Example Gates Cleared
                      </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                      {alert.pair} — {alert.direction}
                    </h2>
                    <p className="text-base text-slate-700 dark:text-slate-300 mt-1 max-w-3xl">
                      {alert.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to="/alerts">
                    <Button variant="primary" icon={<ArrowRight size={18} />} iconPosition="right">
                      View Alert Gates
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Key Gate Metrics Ribbon */}
              <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-400/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm tabular-nums">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                    Deviation
                  </span>
                  <span className="font-black text-base text-slate-950 dark:text-white">
                    +{alert.deviationBps} bps ({alert.zScore}σ)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                    Round-Trip Cost Hurdle
                  </span>
                  <span className="font-black text-base text-rose-600 dark:text-rose-400">
                    -{alert.roundTripCostBps} bps
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                    Net Expected Alpha
                  </span>
                  <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                    +{alert.netEdgeBps} bps
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                    Days to Tender
                  </span>
                  <span className="font-black text-base text-slate-950 dark:text-white">
                    {alert.daysToTender} days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Four Contract Cards */}
      <section aria-labelledby="contracts-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="contracts-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              The Four MCX Gold Contracts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Direct comparison of normalized price per gram on standard 999 fine gold basis.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span className="w-3 h-3 rounded-full bg-[#9A7135] inline-block" />
            <span>Sample normalized price trend</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.contracts.map((contract) => {
            const price = data.latestPrices.find((p) => p.symbol === contract.symbol);
            const sparklineData = getSparklineForSymbol(contract.symbol);
            const isBenchmark = contract.symbol === 'GOLDM';

            return (
              <Card
                key={contract.symbol}
                hoverEffect
                className="flex flex-col justify-between relative overflow-hidden glass-panel-interactive border border-slate-200/80 dark:border-white/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {contract.symbol}
                        </span>
                        {isBenchmark && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-500/20">
                            Benchmark
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                        {contract.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                        Purity
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {(contract.purity * 1000).toFixed(0)} ({contract.purity === 0.995 ? '995' : '999'})
                      </span>
                    </div>
                  </div>

                  {/* Main Normalized Settle Price */}
                  <div className="mt-2 mb-3">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>Normalised 999 Settle</span>
                      <Tooltip termKey="fine-gold" iconOnly />
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-tight tabular-nums">
                      ₹{price?.pricePerGram999.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                        / gram
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (price?.dailyChangePct ?? 0) >= 0
                            ? 'bg-[#0D9488]/15 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0D9488]/30'
                            : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {(price?.dailyChangePct ?? 0) >= 0 ? '+' : ''}
                        {price?.dailyChangePct ?? 0}%
                      </span>
                      <span className="text-xs text-slate-500 truncate tabular-nums">
                        MCX Quote: ₹{price?.settlePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sparkline & Microstructure */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-semibold">Trend (20d)</span>
                    <Sparkline data={sparklineData} color="#B45309" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400 tabular-nums">
                    <div>
                      <span className="block text-slate-400 font-medium">Volume</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {price?.volume.toLocaleString('en-IN')} lots
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Open Interest</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {price?.openInterest.toLocaleString('en-IN')} lots
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Lot: {contract.tradingUnitGrams}g</span>
                    <span>Bid-Ask: ~{contract.typicalBidAskBps} bps</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Data Health Strip */}
      <section
        aria-label="Data health synchronization summary"
        className="rounded-2xl border border-slate-200/80 dark:border-white/10 glass-panel p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
            <HeartPulse size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Sample Data Source
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Synthetic · no live feed
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Sample timestamp: {data.healthSummary.lastUpdate} • {data.healthSummary.rowsLoaded} illustrative rows • {data.healthSummary.rejectedCount} example filtered dates.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Link to="/health">
            <Button variant="outline" size="sm" icon={<Database size={15} />}>
              View Full Health Logs
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. Key Numbers */}
      <section aria-labelledby="key-numbers-heading" className="space-y-3">
        <h2 id="key-numbers-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Illustrative Signal Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Sample Alerts"
            value={data.keyMetrics.alertsThisMonth}
            subtext="Fixture count; not a live alert total"
            icon={<AlertTriangle size={20} className="text-blue-600 dark:text-blue-300" />}
          />
          <StatCard
            label="Sample Alert Precision"
            value={`${data.keyMetrics.alertPrecisionPct}%`}
            subtext="Illustrative fixture; not observed performance"
            termKey="basis-point"
            icon={<ShieldCheck size={20} className="text-[#0D9488] dark:text-[#2DD4BF]" />}
          />
          <StatCard
            label="Sample Days Since Alert"
            value={`${data.keyMetrics.daysSinceLastAlert}d`}
            subtext="Fixture value; not current market status"
            termKey="half-life"
            icon={<Calendar size={20} className="text-blue-500" />}
          />
        </div>
      </section>

      {/* 5. "How to Read This" Panel + Pair Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300">
                <Eye size={20} />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                How to Read GoldLens Arbitrage
              </h3>
            </div>

            <ul className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    Purity Normalization is Fundamental:
                  </strong>{' '}
                  GOLDM settles on 995 purity, whereas GOLDTEN, GOLDGUINEA, and GOLDPETAL settle on 999 purity. Comparing raw quotes yields an illusion of cheapness. GoldLens normalizes all 4 contracts to 999 pure gold before testing spreads.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    The 5-Gate Cost Hurdle:
                  </strong>{' '}
                  Even when a spread drifts 2.0σ, entering requires crossing two bid-ask spreads, paying CTT (0.01%), stamp duty, and exchange fees. Signals are suppressed unless expected edge comfortably clears the cost band.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">
                    Interpreting Sample States:
                  </strong>{' '}
                  The quiet state shown here is a fixture and says nothing about current MCX conditions. A live system would need validated market data and tested alert gates.
                </div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Pair preferences are available to the local demo profile only. */}
        <div>
          {!user ? (
            <Card className="h-full flex flex-col justify-between border border-blue-200 dark:border-blue-400/20 bg-blue-50/60 dark:bg-blue-400/5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="amber">Market Participant</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Public Demo Preview
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Sign-in and account creation are unavailable. You can explore the sample prices, spreads, and methodology without an account.
                </p>
              </div>

              <Link to="/spreads" className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-400/20 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                Explore sample spreads <ArrowRight size={15} className="inline" />
              </Link>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Your Monitored Pairs
                  </span>
                  <Link
                    to="/settings"
                    className="text-xs text-blue-700 dark:text-blue-300 font-semibold hover:underline"
                  >
                    Manage
                  </Link>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.followedPairs.length} Pairs Actively Monitored
                </h3>
                <div className="space-y-2 mt-3">
                  {user.followedPairs.map((pair) => (
                    <div
                      key={pair}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs font-semibold"
                    >
                      <span className="text-slate-900 dark:text-white">{pair}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">In Band (Quiet)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
                <span>Alert Channel: {user.alertChannel}</span>
                <span>Quiet Hours: {user.quietHoursStart || '23:00'} - {user.quietHoursEnd || '08:00'}</span>
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
};
