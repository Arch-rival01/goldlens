import React, { useState, useEffect } from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { getHealth } from '../lib/api';
import { DataHealth } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const Health: React.FC = () => {
  const [health, setHealth] = useState<DataHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load health telemetry');
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
        <Skeleton variant="text" width="220px" height="32px" />
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="rectangular" height="240px" />
      </div>
    );
  }

  if (error || !health) {
    return (
      <ErrorState title="Failed to load health logs" message={error || 'Telemetry offline'} onRetry={loadData} />
    );
  }

  const coverageColumns: Column<DataHealth['coveragePerContract'][0]>[] = [
    { key: 'symbol', header: 'Contract' },
    { key: 'tradingDays', header: 'Sample Sessions', align: 'right', render: (r) => `${r.tradingDays} sessions` },
    { key: 'missingQuotes', header: 'Example Missing Quotes', align: 'right', render: (r) => r.missingQuotes },
    { key: 'settlementIntegrity', header: 'Illustrative Integrity', align: 'right', render: (r) => <span className="font-mono">{r.settlementIntegrity.toFixed(1)}%</span> },
    { key: 'avgDailyVolumeLakhs', header: 'Example Turnover', align: 'right', render: (r) => `₹${r.avgDailyVolumeLakhs} Lakh` }
  ];

  const rejectedColumns: Column<DataHealth['rejectedDates'][0]>[] = [
    { key: 'date', header: 'Calendar Date' },
    { key: 'symbol', header: 'Target Instrument' },
    { key: 'reason', header: 'Quarantine Filter Reason' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sample Data Health
            </h1>
            <Badge variant="demo">Illustrative checks only</Badge>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
            Example coverage and quality fields for the planned pipeline. No MCX Bhavcopy ingestion or validation is running in this frontend demo.
          </p>
        </div>
      </div>

      {/* Illustrative Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pipeline Status"
          value="Not connected"
          subtext="No ingestion or settlement sync has run"
          icon={<HeartPulse size={20} className="text-[#0D9488] dark:text-[#2DD4BF]" />}
        />
        <StatCard
          label="Illustrative Rows"
          value={`${health.rowsLoaded}`}
          subtext="Fixture count; not verified exchange rows"
          icon={<Database size={20} className="text-blue-600 dark:text-blue-300" />}
        />
        <StatCard
          label="Example Filter Entries"
          value={`${health.rejectedDates.length}`}
          subtext="Sample rows; not an ingestion log"
          icon={<AlertTriangle size={20} className="text-slate-500" />}
        />
      </div>

      {/* Quality Flags */}
      <section aria-labelledby="flags-heading" className="space-y-3">
        <h2 id="flags-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Planned Quality Checks (Not Run)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          These descriptions illustrate checks intended for the backend; their displayed status is not the result of a live validation run.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {health.qualityFlags.map((flag) => (
            <div
              key={flag.flag}
              className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] flex items-start gap-3 shadow-xs"
            >
              <CheckCircle2 size={20} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {flag.flag}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {flag.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Table */}
      <section aria-labelledby="coverage-heading" className="space-y-3">
        <h2 id="coverage-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Example Contract Coverage
        </h2>
        <DataTable
          data={health.coveragePerContract}
          columns={coverageColumns}
          keyExtractor={(row) => row.symbol}
          caption="Illustrative coverage values; not measured exchange data"
        />
      </section>

      {/* Rejected Dates Log */}
      <section aria-labelledby="rejected-heading" className="space-y-3">
        <h2 id="rejected-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Example Rejected-Date Entries
        </h2>
        <DataTable
          data={health.rejectedDates}
          columns={rejectedColumns}
          keyExtractor={(row) => `${row.date}-${row.symbol}`}
          caption="Illustrative rejection examples; not a live exchange-processing log"
        />
      </section>
    </div>
  );
};
