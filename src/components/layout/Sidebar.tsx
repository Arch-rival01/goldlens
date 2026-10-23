import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  GitCompare,
  Activity,
  History,
  Layers,
  Calendar,
  Sparkles,
  Shield,
  HeartPulse,
  BookOpen,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CreditCard
} from 'lucide-react';
import { useUser } from '../../lib/auth';

export interface SidebarProps {
  className?: string;
}

export const NAV_LINKS = [
  { path: '/', label: 'Overview', icon: <Compass size={20} /> },
  { path: '/spreads', label: 'Spread Monitor', icon: <GitCompare size={20} /> },
  { path: '/prices', label: 'Normalised Prices', icon: <Activity size={20} /> },
  { path: '/trade-history', label: 'Trade History', icon: <History size={20} /> },
  { path: '/curve', label: 'Term Structure', icon: <Layers size={20} /> },
  { path: '/calendar', label: 'Lifecycle Calendar', icon: <Calendar size={20} /> },
  { path: '/backtest', label: 'Backtest Lab', icon: <Sparkles size={20} /> },
  { path: '/alerts', label: 'Alerts Terminal', icon: <Shield size={20} /> },
  { path: '/health', label: 'Data Health', icon: <HeartPulse size={20} /> }
];

export const SECONDARY_LINKS = [
  { path: '/plans', label: 'Plans', icon: <CreditCard size={18} />, badge: 'Coming soon' },
  { path: '/about', label: 'Methodology', icon: <BookOpen size={18} /> },
  { path: '/glossary', label: 'Glossary', icon: <BookOpen size={18} /> },
  { path: '/faq', label: 'Help & FAQ', icon: <HelpCircle size={18} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={18} /> }
];

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { role } = useUser();

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-[#1E293B] bg-white/75 dark:bg-[#0F172A]/85 backdrop-blur-2xl transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#1E293B]">
        {!isCollapsed && (
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
            Navigation
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1E293B] min-h-[36px] min-w-[36px] flex items-center justify-center mx-auto transition-colors focus-visible:outline-[#2563EB]"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Core Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="Main Navigation">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            title={link.label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                isActive
                  ? 'morphic-btn-primary font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B]/70 hover:text-slate-950 dark:hover:text-white backdrop-blur-xs'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!isCollapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}

        <div className="pt-3 pb-1">
          <div className="border-t border-slate-200/80 dark:border-[#1E293B]" />
        </div>

        {SECONDARY_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            title={link.label}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-slate-200/80 dark:bg-[#1E293B] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]/50 hover:text-slate-900 dark:hover:text-slate-200'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0">{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </div>
            {!isCollapsed && link.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 border border-blue-200 dark:border-blue-400/20 shrink-0">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}

        {role === 'admin' && (
          <NavLink
            to="/admin"
            title="Admin Desk"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-sm transition-colors text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/10 min-h-[44px] ${
                isActive ? 'bg-[#2563EB]/10 font-bold' : ''
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <ShieldAlert size={18} className="shrink-0" />
            {!isCollapsed && <span>Admin Desk</span>}
          </NavLink>
        )}
      </nav>

      {/* Bottom info badge */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            GoldLens Research
          </div>
          <p className="line-clamp-2">MCX Relative Value & Arbitrage Terminal</p>
        </div>
      )}
    </aside>
  );
};
