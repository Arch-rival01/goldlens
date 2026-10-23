import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Compass,
  GitCompare,
  Activity,
  History,
  Shield,
  MoreHorizontal,
  Layers,
  Calendar,
  Sparkles,
  HeartPulse,
  BookOpen,
  HelpCircle,
  Settings,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { useUser } from '../../lib/auth';
import { PWAInstallButton } from './PWAInstallButton';

export const MobileTabBar: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, role } = useUser();

  const handleNavClick = () => {
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/85 dark:bg-[#0F172A]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-[#1E293B] px-2 py-1 flex items-center justify-around safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <Compass size={20} />
          <span className="mt-1">Overview</span>
        </NavLink>

        <NavLink
          to="/spreads"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <GitCompare size={20} />
          <span className="mt-1">Spreads</span>
        </NavLink>

        <NavLink
          to="/prices"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <Activity size={20} />
          <span className="mt-1">Prices</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-1 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <Shield size={20} />
          <span className="mt-1">Alerts</span>
        </NavLink>

        <button
          onClick={() => setIsMoreOpen(true)}
          aria-label="Open more menu"
          aria-expanded={isMoreOpen}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] flex-1 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <MoreHorizontal size={20} />
          <span className="mt-1">More</span>
        </button>
      </nav>

      {/* Sheet for 'More' Menu */}
      <Sheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="GoldLens Navigation & Account">
        <div className="space-y-6 pb-6">
          {/* PWA Install Button on mobile */}
          <div className="p-3 bg-[#2563EB]/10 rounded-2xl border border-[#2563EB]/20 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Install App on Phone
            </span>
            <PWAInstallButton />
          </div>

          {/* Additional Analytics Modules */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-2">
              Advanced Analytics
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/curve"
                onClick={handleNavClick}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-sm font-semibold transition-colors"
              >
                <Layers size={18} className="text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Term Structure</span>
              </Link>
              <Link
                to="/calendar"
                onClick={handleNavClick}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-sm font-semibold transition-colors"
              >
                <Calendar size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" />
                <span>Calendar</span>
              </Link>
              <Link
                to="/backtest"
                onClick={handleNavClick}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-sm font-semibold transition-colors"
              >
                <Sparkles size={18} className="text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Backtest Lab</span>
              </Link>
              <Link
                to="/health"
                onClick={handleNavClick}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-sm font-semibold transition-colors"
              >
                <HeartPulse size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" />
                <span>Data Health</span>
              </Link>
              <Link
                to="/trade-history"
                onClick={handleNavClick}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] text-sm font-semibold transition-colors"
              >
                <History size={18} className="text-slate-600 dark:text-slate-300" />
                <span>Trade History</span>
              </Link>
            </div>
          </div>

          {/* Research & Documentation */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-2">
              Research & Help
            </h4>
            <div className="space-y-1">
              <Link
                to="/about"
                onClick={handleNavClick}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} /> Methodology & Whitepaper
                </span>
              </Link>
              <Link
                to="/glossary"
                onClick={handleNavClick}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} /> Quantitative Glossary
                </span>
              </Link>
              <Link
                to="/faq"
                onClick={handleNavClick}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle size={16} /> Help & FAQ
                </span>
              </Link>
              <Link
                to="/plans"
                onClick={handleNavClick}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <CreditCard size={16} /> Subscription Plans
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                  Coming soon
                </span>
              </Link>
            </div>
          </div>

          {/* Demo profile and administration */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    onClick={handleNavClick}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Settings size={20} />
                  </Link>
                </div>

                {role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm"
                  >
                    <ShieldAlert size={18} /> Admin Desk
                  </Link>
                )}

              </div>
            ) : (
              <div className="space-y-2">
                <p className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Public demo mode
                </p>
                <Link
                  to="/welcome"
                  onClick={handleNavClick}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-center block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  View 3-Step Guided Tour
                </Link>
              </div>
            )}
          </div>
        </div>
      </Sheet>
    </>
  );
};
