import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Server,
  Activity,
  Users,
  MessageSquare,
  AlertTriangle,
  CircleOff
} from 'lucide-react';
import { useUser } from '../lib/auth';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { toast } from '../components/ui/Toast';

export const Admin: React.FC = () => {
  const { user, role, setDemoMode } = useUser();

  // Redirect signed-out users to the public overview.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is not admin, show "Access Denied"
  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <Card variant="alert" className="p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-[0_0_16px_rgba(37,99,235,0.12)]">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            Access Denied
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            The <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">/admin</code> portal is restricted to Risk Desk operators. You are currently in <strong>{role}</strong> mode.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setDemoMode('admin');
                toast.success('Switched to Mock Admin role.', 'Demo Switcher');
              }}
            >
              Switch to Mock Admin Role
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Return to Overview
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-in fade-in duration-150">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Risk Desk & System Administration
            </h1>
            <Badge variant="navy">Demo Admin</Badge>
            <Badge variant="demo">Sample data</Badge>
          </div>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
            Mock administration preview. No exchange ingestion jobs, alert engine, or live user telemetry are connected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            icon={<CircleOff size={15} />}
          >
            Sync not connected
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Sample Users"
          value="—"
          subtext="No live user telemetry"
          icon={<Users size={20} className="text-blue-500" />}
        />
        <StatCard
          label="Ingestion Jobs"
          value="Not connected"
          subtext="No jobs have run"
          icon={<Server size={20} className="text-emerald-500" />}
        />
        <StatCard
          label="Alert Engine"
          value="Not running"
          subtext="No gates evaluated"
          icon={<Activity size={20} className="text-amber-500" />}
        />
        <StatCard
          label="Feedback Inbox"
          value="Sample only"
          subtext="Illustrative entries below"
          icon={<MessageSquare size={20} className="text-purple-500" />}
        />
      </div>

      {/* Section 1: Data Ingestion Jobs */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server size={20} className="text-amber-500" />
          <span>Example Ingestion Schedule (Not Running)</span>
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {[
            { name: 'MCX settlement import (planned)', cron: 'example schedule', lastRun: 'Not run', status: 'Preview only · not connected' },
            { name: 'Order-book depth scan (planned)', cron: 'example schedule', lastRun: 'Not run', status: 'Preview only · not connected' },
            { name: 'Tender-window check (planned)', cron: 'example schedule', lastRun: 'Not run', status: 'Preview only · not connected' },
            { name: 'Fee schedule update (planned)', cron: 'example schedule', lastRun: 'Not run', status: 'Preview only · not connected' }
          ].map((job) => (
            <div key={job.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white block">
                  {job.name}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Cron: {job.cron} • Last run: {job.lastRun}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {job.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  icon={<CircleOff size={13} />}
                >
                  Unavailable
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 2: Rejected Dates & Anomaly Audit Log */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          <span>Example Rejected-Row Log</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 font-semibold text-gray-500 text-xs uppercase">
                <th className="py-2.5">Date</th>
                <th>Target Contract</th>
                <th>Reason</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-800 dark:text-gray-200 text-sm">
              <tr>
                <td className="py-3 font-mono">2026-10-02</td>
                <td>ALL</td>
                <td>Example date filter; verify exchange calendar</td>
                <td><Badge variant="neutral" size="sm">Sample only</Badge></td>
              </tr>
              <tr>
                <td className="py-3 font-mono">2026-09-07</td>
                <td>GOLDPETAL</td>
                <td>Example invalid-row filter; no tick feed</td>
                <td><Badge variant="neutral" size="sm">Sample only</Badge></td>
              </tr>
              <tr>
                <td className="py-3 font-mono">2026-08-15</td>
                <td>ALL</td>
                <td>Example date filter; verify exchange calendar</td>
                <td><Badge variant="neutral" size="sm">Sample only</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 3: Feedback Inbox */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-purple-500" />
          <span>Example Feedback Entries</span>
        </h2>
        <div className="space-y-3">
          {[
            { email: 'reviewer-one@example.invalid', rating: 5, date: 'Sample date', text: 'Example feedback about purity normalization and the research interface.' },
            { email: 'reviewer-two@example.invalid', rating: 4, date: 'Sample date', text: 'Example feedback requesting future alert-delivery options.' }
          ].map((f, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{f.email}</span>
                <span>{f.date} • {f.rating} / 5 ★</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{f.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
