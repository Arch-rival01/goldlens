import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
  HelpCircle,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useUser } from '../../lib/auth';
import { useTheme } from './ThemeContext';
import { Badge } from '../ui/Badge';
import { NotificationItem } from '../../lib/types';
import { MOCK_NOTIFICATIONS } from '../../mock/notifications';
import { PWAInstallButton } from './PWAInstallButton';

export interface HeaderProps {
  pageTitle: string;
  onOpenMobileMenu?: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenMobileMenu,
  onOpenCommandPalette
}) => {
  const { user, role } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-[#1E293B] bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-colors">
      <div className="flex items-center justify-between h-16 sm:h-18 px-4 sm:px-6 max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* Left: Mobile Menu button, Brand Logo, Title & Demo Badge */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              aria-label="Open navigation sidebar"
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-[#2563EB]"
            >
              <Menu size={22} />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:outline-[#2563EB] rounded-xl group shrink-0"
            aria-label="GoldLens Home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.24)] p-1.5 border border-white/40">
              <span className="text-white font-black text-base tracking-tighter drop-shadow-xs">GL</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Gold<span className="text-[#2563EB] dark:text-[#60A5FA]">Lens</span>
              </span>
            </div>
          </Link>

          <div className="h-6 w-px bg-slate-200 dark:bg-[#1E293B] mx-1 hidden md:block" />

          {/* Current Page Title & Demo Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {pageTitle}
            </h1>
            <Badge variant="demo" size="sm" className="hidden sm:inline-flex shrink-0">
              Demo data - not market data
            </Badge>
          </div>
        </div>

        {/* Right: Actions (Search Ctrl+K, Time, PWA, Notif, Theme, User) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Demo source status (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1E293B]/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] tabular-nums">
            <Clock size={13} className="text-[#0D9488] dark:text-[#2DD4BF]" />
            <span>Sample data · no live sync</span>
          </div>

          {/* Search / Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Open search and command palette"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 backdrop-blur-md bg-white/60 dark:bg-[#1E293B]/70 hover:bg-white/90 dark:hover:bg-[#1E293B] border border-slate-200/80 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] min-h-[44px] min-w-[44px] transition-all focus-visible:outline-[#2563EB]"
            title="Search pages and pairs (Ctrl+K)"
          >
            <Search size={18} className="text-[#2563EB] dark:text-[#60A5FA]" />
            <span className="hidden md:inline text-sm text-slate-600 dark:text-slate-300 font-semibold">
              Search...
            </span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-slate-100 dark:bg-[#0F172A] font-mono text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* PWA Install */}
          <div className="hidden lg:block">
            <PWAInstallButton compact />
          </div>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={isNotifOpen}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-[#2563EB] transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0F172A]" />
              )}
            </button>

            {isNotifOpen && (
              <div
                role="region"
                aria-label="Recent notifications"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200/80 dark:border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 z-50 animate-in zoom-in-95 duration-150 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <Badge variant="warning" size="sm">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto my-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-3 px-1 transition-colors ${
                        !n.read ? 'bg-[#2563EB]/10 rounded-lg px-2' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="shrink-0 mt-0.5">
                          {n.type === 'lifecycle' && (
                            <Clock size={16} className="text-[#2563EB] dark:text-[#60A5FA]" />
                          )}
                          {n.type === 'system' && (
                            <CheckCircle2 size={16} className="text-[#0D9488] dark:text-[#2DD4BF]" />
                          )}
                          {n.type === 'alert' && (
                            <AlertTriangle size={16} className="text-rose-500" />
                          )}
                          {n.type === 'health' && (
                            <CheckCircle2 size={16} className="text-blue-500" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {n.title}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 text-slate-400">
                            <span>{n.createdAt}</span>
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => setIsNotifOpen(false)}
                                className="text-[#2563EB] dark:text-[#60A5FA] hover:underline font-bold inline-flex items-center gap-1"
                              >
                                View <ExternalLink size={11} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#60A5FA] block py-1"
                  >
                    View all notification logs →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-[#2563EB] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-[#60A5FA]" />
            ) : (
              <Moon size={20} className="text-slate-700" />
            )}
          </button>

          {/* Public preview status or demo profile menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User profile menu"
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] min-h-[44px] min-w-[44px] focus-visible:outline-[#2563EB] transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2563EB] shadow-sm"
                />
                <span className="hidden md:inline text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200/80 dark:border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 animate-in zoom-in-95 duration-150 backdrop-blur-2xl"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1E293B]">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                        {role === 'admin' ? 'Admin Role' : 'Research User'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg font-medium"
                    >
                      <Settings size={16} /> Settings
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg font-medium"
                    >
                      <Bell size={16} /> Notifications
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg font-medium"
                    >
                      <HelpCircle size={16} /> Help & FAQ
                    </Link>
                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/10 rounded-lg font-bold"
                      >
                        <UserIcon size={16} /> Admin Portal
                      </Link>
                    )}
                  </div>

                </div>
              )}
            </div>
          ) : (
            <span className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Public demo
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
