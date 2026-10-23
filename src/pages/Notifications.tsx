import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications } from '../lib/api';
import { NotificationItem } from '../lib/types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { toast } from '../components/ui/Toast';

export const Notifications: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'alert' | 'lifecycle' | 'system' | 'health'>('all');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success('All notifications marked as read.', 'Inbox Updated');
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton variant="text" width="220px" height="32px" />
        <Skeleton variant="card" height="120px" />
        <Skeleton variant="card" height="120px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState title="Failed to load notifications" message={error} onRetry={loadData} />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Notification & Audit Feed
            </h1>
            <Badge variant="demo">Demo feed</Badge>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
            System logs, tender countdown warnings, and historical trade resolution notices.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark All Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['all', 'alert', 'lifecycle', 'health', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all min-h-[44px] cursor-pointer ${
              filter === tab
                ? 'morphic-btn-primary shadow-sm'
                : 'backdrop-blur-md bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No notifications in this category.
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 sm:p-5 transition-colors glass-panel ${
                !item.read
                  ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-400/10'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] shrink-0 mt-0.5 border border-slate-200/60 dark:border-[#1E293B]">
                  {item.type === 'lifecycle' && <Clock size={18} className="text-blue-600 dark:text-blue-300" />}
                  {item.type === 'alert' && <AlertTriangle size={18} className="text-rose-500" />}
                  {item.type === 'system' && <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" />}
                  {item.type === 'health' && <CheckCircle2 size={18} className="text-blue-500" />}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="text-xs text-slate-500 shrink-0">{item.createdAt}</span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.body}
                  </p>

                  {item.link && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                      <Link
                        to={item.link}
                        className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline inline-flex items-center gap-1"
                      >
                        Inspect target module <ExternalLink size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
