import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, AlertTriangle, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { getCalendar } from '../lib/api';
import { CalendarItem } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DataTable, Column } from '../components/ui/DataTable';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';

export const CalendarPage: React.FC = () => {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCalendar();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contract calendar');
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
        <Skeleton variant="rectangular" height="300px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load calendar"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const columns: Column<CalendarItem>[] = [
    {
      key: 'symbol',
      header: 'Contract & Month',
      render: (r) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white block">{r.symbol}</span>
          <span className="text-xs text-gray-500 font-mono">{r.contractMonth}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Lifecycle Phase',
      render: (r) => {
        if (r.status === 'Tender Period') {
          return (
            <Badge variant="danger" size="sm" icon={<AlertTriangle size={13} />}>
              Example Tender Period
            </Badge>
          );
        }
        if (r.status === 'Trading') {
          return (
            <Badge variant="success" size="sm" icon={<CheckCircle2 size={13} />}>
              Example Trading Phase
            </Badge>
          );
        }
        return (
          <Badge variant="neutral" size="sm">
            Example {r.status}
          </Badge>
        );
      }
    },
    {
      key: 'tenderStart',
      header: 'Tender Start (Blackout)',
      render: (r) => (
        <span
          className={`font-mono text-sm ${
            r.status === 'Tender Period'
              ? 'text-red-600 dark:text-red-400 font-bold'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {r.tenderStart}
        </span>
      )
    },
    {
      key: 'peakOiDate',
      header: 'Peak Open Interest',
      render: (r) => <span className="font-mono text-sm">{r.peakOiDate}</span>
    },
    {
      key: 'migrationDate',
      header: 'Liquidity Migration',
      render: (r) => <span className="font-mono text-sm text-blue-700 dark:text-blue-300 font-semibold">{r.migrationDate}</span>
    },
    {
      key: 'lastTradingDate',
      header: 'Final Expiry',
      align: 'right',
      render: (r) => <span className="font-mono text-sm font-semibold">{r.lastTradingDate}</span>
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Illustrative Contract Lifecycle & Tender Blackout Calendar
          </h1>
          <Badge variant="demo">Demo data - not market data</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Example lifecycle dates and planned tender-gate behavior. Verify contract dates against current official MCX specifications before use.
        </p>
      </div>

      {/* Tender Period Risk Alert Banner */}
      <Card variant="warning" className="border-blue-200 dark:border-blue-400/20">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-950 dark:text-white text-base sm:text-lg">
                Planned Gate 4: Pre-Tender Exclusion Example
              </h3>
              <Tooltip termKey="tender-period" iconOnly />
            </div>
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
              The proposed workflow excludes contracts within 5 sessions of tender commencement to reduce delivery-related risk. This frontend demo does not calculate or enforce a live exchange gate.
            </p>
            <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
              Example schedule only: GOLDGUINEA Oct-26 and GOLDPETAL Oct-26. Dates and contract rules are not verified.
            </p>
          </div>
        </div>
      </Card>

      {/* Contract Schedule Timeline Table */}
      <section aria-labelledby="timeline-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="timeline-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Example Tenor Cycle Entries
          </h2>
          <span className="text-xs text-gray-500">Sample dates · verify against current MCX notices</span>
        </div>

        <DataTable
          data={items}
          columns={columns}
          keyExtractor={(row) => `${row.symbol}-${row.contractMonth}`}
          caption="Contract lifecycle timeline and tender blackout dates"
        />
      </section>

      {/* Educational Card on Rollover Horizon */}
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Phase 1
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Liquid Accumulation
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The sample workflow assumes liquidity may concentrate ahead of expiry. Validate any such pattern using actual contract data.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Phase 2
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Peak Open Interest & Migration
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The sample workflow tracks open-interest migration. This demo does not measure current liquidity or execution depth.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
            Phase 3
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Tender Quarantine
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Proposed workflow exclusion window. No live tender dates or contract gates are evaluated in this demo.
          </p>
        </div>
      </Card>
    </div>
  );
};
