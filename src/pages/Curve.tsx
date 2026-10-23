import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Layers, TrendingUp, HelpCircle } from 'lucide-react';
import { getCurve, getCarry } from '../lib/api';
import { CurvePoint, CarryDecomposition } from '../lib/types';
import { ChartCard } from '../components/ui/ChartCard';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';

export const Curve: React.FC = () => {
  const [curve, setCurve] = useState<CurvePoint[]>([]);
  const [carry, setCarry] = useState<CarryDecomposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('GOLDM');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [crvRes, cryRes] = await Promise.all([getCurve(), getCarry()]);
      setCurve(crvRes);
      setCarry(cryRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load term structure');
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
        <Skeleton variant="text" width="280px" height="32px" />
        <Skeleton variant="card" height="120px" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" height="340px" />
          <Skeleton variant="card" height="340px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load term structure"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const filteredCurve = curve.filter((c) => c.symbol === selectedSymbol);
  const filteredCarry = carry.filter((c) => c.symbol === selectedSymbol);

  const curveColumns: Column<CurvePoint>[] = [
    { key: 'symbol', header: 'Symbol' },
    { key: 'expiryDate', header: 'Expiry Date' },
    {
      key: 'daysToExpiry',
      header: 'Days to Expiry',
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.daysToExpiry} days</span>
    },
    {
      key: 'price',
      header: 'Normalized Price (₹/g)',
      align: 'right',
      render: (r) => <span className="tabular-nums">₹{r.price.toFixed(2)}</span>
    },
    {
      key: 'annualisedCarryPct',
      header: 'Annualised Carry %',
      align: 'right',
      render: (r) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          +{r.annualisedCarryPct.toFixed(2)}%
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Term Structure & Carry Decomposition
            </h1>
            <Badge variant="demo">Demo data - not market data</Badge>
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
            Illustrative curve and carry fixtures; no live forward curve, financing rate, or roll-down is calculated.
          </p>
        </div>

        {/* Contract Selector */}
        <div className="flex items-center gap-1.5 morphic-tray p-1.5 rounded-2xl backdrop-blur-md self-start sm:self-auto">
          {['GOLDM', 'GOLDTEN', 'GOLDGUINEA', 'GOLDPETAL'].map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedSymbol(sym)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                selectedSymbol === sym
                  ? 'morphic-btn-primary shadow-[0_4px_14px_rgba(245,158,11,0.45)]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Sample Curve Regime"
          value="Illustrative"
          subtext="Not calculated from live settlements"
          termKey="carry"
          icon={<TrendingUp size={20} className="text-emerald-500" />}
        />
        <StatCard
          label="Sample Benchmark Carry"
          value="6.92% p.a."
          subtext="Illustrative fixture; verify inputs"
          termKey="carry"
          icon={<Layers size={20} className="text-amber-500" />}
        />
        <StatCard
          label="Sample 30d Roll-Down"
          value="+₹18.4 / g"
          subtext="Illustrative fixture; not a forecast"
          termKey="roll-down"
          icon={<Layers size={20} className="text-indigo-400" />}
        />
      </div>

      {/* Two Side-by-Side Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Futures Forward Curve */}
        <ChartCard
          title={`Futures Forward Curve: ${selectedSymbol}`}
          subtitle="Normalised INR/g across tenor maturities (Days to Expiry)."
          termKey="carry"
          footerNote="Illustrative fixture points only; not fitted to live settlements. Expiry dates and carrying costs require validation."
        >
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredCurve}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="daysToExpiry"
                  tick={{ fontSize: 13 }}
                  stroke="#888888"
                  unit="d"
                />
                <YAxis
                  tick={{ fontSize: 13 }}
                  stroke="#888888"
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(v) => `₹${v}`}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`₹${Number(val || 0).toFixed(2)}/g`, 'Price']}
                  labelFormatter={(lbl) => `${lbl} days to expiry`}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    borderRadius: '1rem',
                    fontSize: '13px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Forward Settle (₹/g)"
                  stroke="#9A7135"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#B45309' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Carry Decomposition */}
        <ChartCard
          title={`Carry Return Decomposition: ${selectedSymbol}`}
          subtitle="Attribution into level move, curve shape change, and roll-down."
          termKey="roll-down"
          footerNote="Teal = Positive Roll-Down; Gold = Level Shift; Slate = Curve Steepening/Flattening."
        >
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredCarry.slice(-10)}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13 }}
                  stroke="#888888"
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 13 }} stroke="#888888" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    borderRadius: '1rem',
                    fontSize: '13px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(16px)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar dataKey="levelMove" name="Level Move" fill="#B45309" />
                <Bar dataKey="rollDown" name="Roll-Down" fill="#0D9488" />
                <Bar dataKey="curveShapeChange" name="Shape Shift" fill="#64748B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Tenor Maturity Table */}
      <section aria-labelledby="maturities-heading" className="space-y-3">
        <h2 id="maturities-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Active Tenor Points ({selectedSymbol})
        </h2>
        <DataTable
          data={filteredCurve}
          columns={curveColumns}
          keyExtractor={(r) => `${r.symbol}-${r.expiryDate}`}
          caption="Forward curve tenor contracts"
        />
      </section>
    </div>
  );
};
