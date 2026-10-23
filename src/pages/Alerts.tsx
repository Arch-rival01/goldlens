import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { getAlerts } from '../lib/api';
import { Alert } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Tooltip } from '../components/ui/Tooltip';
import { MOCK_SAMPLE_ACTIVE_ALERT } from '../mock/alerts';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<{ active: Alert[]; historical: Alert[] }>({
    active: [],
    historical: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedAlertActive, setSimulatedAlertActive] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve alerts database');
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
        <Skeleton variant="text" width="240px" height="32px" />
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="card" height="120px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load alerts feed"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const activeAlerts = alerts.active;
  const displayedActive: Alert[] = simulatedAlertActive
    ? [MOCK_SAMPLE_ACTIVE_ALERT]
    : activeAlerts;

  const historicalAlerts = alerts.historical;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Relative-Value Alerts Terminal
            </h1>
            <Badge variant="demo">Demo data - not market data</Badge>
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
            Illustrative multi-gate alert examples. No live prices, rule evaluation, or notification delivery is connected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatedAlertActive(!simulatedAlertActive)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/70 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors min-h-[44px] shadow-sm backdrop-blur-md"
            title="Toggle simulated alert"
          >
            <Sliders size={14} className="text-blue-600 dark:text-blue-300" />
            <span>{simulatedAlertActive ? 'Hide Sample Alert' : 'Preview Sample Alert'}</span>
          </button>

        </div>
      </div>

      {/* Active Alerts Section */}
      <section aria-labelledby="active-alerts-heading" className="space-y-4">
        <h2 id="active-alerts-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Sample Dislocation Signals
        </h2>

        {displayedActive.length === 0 ? (
          <div className="rounded-3xl border border-emerald-500/35 bg-emerald-500/10 dark:bg-emerald-950/25 p-6 sm:p-8 text-center max-w-xl mx-auto space-y-3 shadow-lg backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl morphic-btn-teal text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={32} className="stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
              No Sample Alert Is Active
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              No fixture alert is currently selected. This empty state does not describe current market conditions or imply that any live data has been checked.
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
                Example rules are not running
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActive.map((alert) => (
              <Card key={alert.id} variant="warning" className="border border-blue-200 dark:border-blue-400/20 shadow-md">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full morphic-btn-primary shadow-sm">
                        SAMPLE SIGNAL
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {alert.id}
                      </span>
                      <Badge variant="success" size="sm">
                        Example Gates Cleared
                      </Badge>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white pt-1">
                      {alert.pair} — {alert.direction}
                    </h3>

                    <p className="text-base text-slate-700 dark:text-slate-300 max-w-3xl">
                      {alert.summary}
                    </p>
                  </div>

                  <div className="shrink-0 text-right tabular-nums">
                    <span className="text-xs uppercase text-slate-500 font-bold block">
                      Net Edge After Costs
                    </span>
                    <span className="text-3xl font-black text-[#0D9488] dark:text-[#2DD4BF]">
                      +{alert.netEdgeBps} bps
                    </span>
                  </div>
                </div>

                {/* The 5 Gates Visual Verification Breakdown */}
                <div className="mt-5 pt-4 border-t border-blue-200 dark:border-blue-400/20">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                    Example Verification Gates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {alert.gates.map((g, idx) => (
                      <div
                        key={g.name}
                        className="p-3.5 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] flex items-start gap-2.5 shadow-xs"
                      >
                        <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF] shrink-0 mt-0.5" />
                        <div className="text-xs flex-1">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            Gate {idx + 1}: {g.name}
                          </span>
                          <span className="text-[#0D9488] dark:text-[#2DD4BF] font-bold">
                            {g.value}
                          </span>
                          <span className="text-slate-400 block text-[11px]">
                            Requirement: {g.threshold}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trade Parameters */}
                <div className="mt-4 pt-3 border-t border-blue-200/70 dark:border-blue-400/15 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                  <span>Stop Z-Score: {alert.stopZ}σ</span>
                  <span>Max Holdout: {alert.maxHoldDays} days</span>
                  <span>Days to Expiry: {alert.daysToExpiry}d</span>
                  <span>Days to Tender: {alert.daysToTender}d</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Historical Signals Section */}
      <section aria-labelledby="history-heading" className="space-y-4">
        <h2 id="history-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Sample Historical Signal Records
        </h2>

        <div className="space-y-4">
          {historicalAlerts.map((item) => (
            <Card key={item.id} className="p-5 glass-panel">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="success" size="sm">
                      {item.outcome}
                    </Badge>
                    <span className="font-mono text-xs text-slate-500 font-bold">{item.id}</span>
                    <span className="text-xs text-slate-400">
                      Opened {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.pair} — {item.direction}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    {item.summary}
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0 tabular-nums">
                  <span className="text-xs text-slate-500 font-semibold block">Illustrative Edge</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    +{item.netEdgeBps} bps
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
};
