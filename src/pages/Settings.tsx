import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  User,
  Sliders,
  Bell,
  SunMoon,
  Shield,
  Laptop,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '../lib/auth';
import { useTheme } from '../components/layout/ThemeContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { toast } from '../components/ui/Toast';
import { MOCK_PAIRS } from '../mock/spreads';

export const Settings: React.FC = () => {
  const { user, updateUser, signOut } = useUser();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'pairs' | 'alerts' | 'appearance' | 'privacy' | 'sessions'
  >('profile');

  // Form states initialized from user
  const [name, setName] = useState(user?.name || '');
  const [alertChannel, setAlertChannel] = useState(user?.alertChannel || 'email');
  const [quietHoursStart, setQuietHoursStart] = useState(user?.quietHoursStart || '23:30');
  const [quietHoursEnd, setQuietHoursEnd] = useState(user?.quietHoursEnd || '08:00');
  const [minNetEdgeBps, setMinNetEdgeBps] = useState(user?.minNetEdgeBps || 3.5);
  const [minLiquidityScore, setMinLiquidityScore] = useState(user?.minLiquidityScore || 65);
  const [textSize, setTextSize] = useState<'normal' | 'large'>(user?.textSize || 'normal');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Settings are available only for the local demo profile.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name });
    toast.success('Profile details saved successfully.', 'Profile Updated');
  };

  const handleSaveAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      alertChannel,
      quietHoursStart,
      quietHoursEnd,
      minNetEdgeBps,
      minLiquidityScore
    });
    toast.success('Alert threshold preferences updated.', 'Preferences Saved');
  };

  const handleTogglePair = (pair: string) => {
    const current = user.followedPairs || [];
    const updated = current.includes(pair)
      ? current.filter((p) => p !== pair)
      : [...current, pair];
    updateUser({ followedPairs: updated });
    toast.success(`Updated tracking preferences for ${pair}.`, 'Pairs Updated');
  };

  const handleDownloadData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `goldlens_user_${user.id}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('User configuration exported as JSON.', 'Export Ready');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleteModalOpen(false);
    toast.error('Account purged from local memory.', 'Account Deleted');
    signOut();
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'pairs', label: 'Followed Pairs', icon: <Sliders size={16} /> },
    { id: 'alerts', label: 'Alert Preferences', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <SunMoon size={16} /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <Shield size={16} /> },
    { id: 'sessions', label: 'Sessions', icon: <Laptop size={16} /> }
  ] as const;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Settings & Terminal Preferences
          </h1>
          <Badge variant="demo">Demo user session</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Manage your research profile, watched contract pairs, alert channels, and data export.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-200 dark:border-slate-800 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all min-h-[44px] cursor-pointer ${
              activeTab === t.id
                ? 'morphic-btn-primary shadow-sm'
                : 'backdrop-blur-md bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card className="p-6 glass-panel">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Research Profile
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-500 shadow-sm"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <Badge variant="navy" size="sm" className="mt-1">
                  Role: {user.role.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Email Address (Read-only in demo mode)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-100 dark:bg-slate-800/50 px-3.5 py-2.5 text-base text-gray-500"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Followed Pairs */}
      {activeTab === 'pairs' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Followed Synthetic Spread Pairs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select which cross-contract pairs GoldLens will monitor for statistical edge and send alerts for.
          </p>

          <div className="space-y-3">
            {MOCK_PAIRS.map((pair) => {
              const isChecked = user.followedPairs.includes(pair);
              return (
                <div
                  key={pair}
                  onClick={() => handleTogglePair(pair)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 accent-amber-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-base text-slate-900 dark:text-white block">
                        {pair}
                      </span>
                      <span className="text-xs text-slate-500">
                        {pair === 'GOLDM / GOLDPETAL'
                          ? '100g Benchmark vs 1g Retail'
                          : pair === 'GOLDM / GOLDTEN'
                          ? '100g Mini vs 10g Bar'
                          : 'Cross-denomination spread'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-500">
                    {isChecked ? 'Following' : 'Click to follow'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tab 3: Alert Preferences */}
      {activeTab === 'alerts' && (
        <Card className="p-6 glass-panel">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Dislocation Alert Thresholds & Channels
          </h2>
          <form onSubmit={handleSaveAlerts} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Primary Alert Channel
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'email', label: 'Email Digest', badge: 'Active' },
                  { id: 'telegram', label: 'Telegram Bot', badge: 'Coming soon' },
                  { id: 'none', label: 'Silent Mode', badge: 'No alerts' }
                ].map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => setAlertChannel(ch.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      alertChannel === ch.id
                        ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{ch.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                        {ch.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Minimum Net Edge Hurdle (bps)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="20"
                  value={minNetEdgeBps}
                  onChange={(e) => setMinNetEdgeBps(parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-gray-900 dark:text-white"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Suppress alerts where net profit after bid-ask is below this threshold.
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Minimum Liquidity Score (0-100)
                </label>
                <input
                  type="number"
                  min="30"
                  max="95"
                  value={minLiquidityScore}
                  onChange={(e) => setMinLiquidityScore(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-gray-900 dark:text-white"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Rejects thin order books to avoid market impact costs.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Quiet Hours (Silence Notifications)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary">
                Save Alert Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 4: Appearance */}
      {activeTab === 'appearance' && (
        <Card className="p-6 space-y-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Appearance & Visual Comfort
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-slate-900 text-white shadow-md'
                    : 'border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                Dark Terminal (Default)
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-500/10 text-slate-900 shadow-md'
                    : 'border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                Light High-Contrast
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Typography Size
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setTextSize('normal');
                  updateUser({ textSize: 'normal' });
                }}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  textSize === 'normal'
                    ? 'border-amber-500 bg-amber-500/15 font-bold text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Standard (16px base)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextSize('large');
                  updateUser({ textSize: 'large' });
                }}
                className={`p-3 rounded-xl border text-base font-semibold transition-all cursor-pointer ${
                  textSize === 'large'
                    ? 'border-amber-500 bg-amber-500/15 font-bold text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Large (18px base)
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: Privacy & Data */}
      {activeTab === 'privacy' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Data Sovereignty & Local Storage
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Export your configured thresholds or purge your prototype preferences.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Download Profile & Watchlist JSON
              </h3>
              <p className="text-xs text-gray-500">
                Exports all your local settings, followed pairs, and alert thresholds.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadData}
              icon={<Download size={16} />}
            >
              Export JSON
            </Button>
          </div>

          <div className="p-4 rounded-xl border-2 border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-red-900 dark:text-red-300">
                Delete Account & Purge Local Data
              </h3>
              <p className="text-xs text-red-700 dark:text-red-400">
                Permanently wipes all saved watchlist pairs and returns to guest mode.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              icon={<Trash2 size={16} />}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 6: Sessions */}
      {activeTab === 'sessions' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Active Mock Device Sessions
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop size={22} className="text-amber-500" />
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    MacBook Pro • Chrome 132 (Current Device)
                  </p>
                  <p className="text-xs text-gray-500">Mumbai, India • Active now</p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                Active Session
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-between opacity-75">
              <div className="flex items-center gap-3">
                <Laptop size={22} className="text-slate-400" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    iPhone 16 Pro • Safari Mobile
                  </p>
                  <p className="text-xs text-gray-500">Bengaluru, India • 2 days ago</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Idle</span>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Purge"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-sm">
            <p className="font-bold">This action cannot be undone.</p>
            <p className="text-xs mt-1">
              To confirm deletion of your mock session, please type <strong>DELETE</strong> below:
            </p>
          </div>

          <input
            type="text"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base font-bold text-center"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmationText !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
