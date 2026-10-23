import React, { useEffect, useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getResearch } from '../../lib/api';
import { ResearchReport } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

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

export const ResearchSignals: React.FC = () => {
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResearch(20)
      .then(setReport)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Research API is unavailable.');
      });
  }, []);

  return (
    <section aria-labelledby="research-signals-heading">
      <Card className="border-blue-200 p-5 dark:border-blue-900/70 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Radio size={18} className="text-blue-600 dark:text-blue-400" />
              <h2 id="research-signals-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                Imported MCX research feed
              </h2>
              <Badge variant={report?.currentSignals.length ? 'success' : 'neutral'}>
                {report ? (report.currentSignals.length ? 'Gate-cleared candidate' : 'Quiet') : 'Loading'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Separate from the synthetic overview panels. No live feed or trade execution is connected.
            </p>
          </div>
          <Link to="/backtest" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-white dark:border-white/15 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-800">
            Research details <ArrowRight size={16} />
          </Link>
        </div>

        {error ? (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
            Research data is unavailable: {error}
          </p>
        ) : !report ? (
          <p role="status" className="mt-4 text-sm text-slate-500">Checking imported settlements…</p>
        ) : report.currentSignals.length === 0 ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            <p>{report.quietReason}</p>
            <p className="mt-1 text-xs text-slate-500">
              {report.coverage.rows.toLocaleString()} imported rows · {report.coverage.sessions} dates · latest {formatDate(report.coverage.lastDate)}
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {report.currentSignals.slice(0, 3).map((signal) => (
              <li key={`${signal.pair}-${signal.expiryDate}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{signal.pair} · {formatDate(signal.expiryDate)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {signal.sideA} {signal.lotsA} {signal.symbolA} / {signal.sideB} {signal.lotsB} {signal.symbolB} · z {signal.zScore.toFixed(2)} · {signal.expectedNetEdgeBps.toFixed(1)} net bps
                  </p>
                </div>
                <p className="font-mono font-semibold text-slate-900 dark:text-white">{currency.format(signal.expectedNetPnlInr)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
};
