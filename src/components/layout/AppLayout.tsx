import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { FeedbackDialog } from './FeedbackDialog';
import { PrivacyNotice } from './PrivacyNotice';
import { OfflineIndicator } from './OfflineIndicator';
import { ToastContainer } from '../ui/Toast';
import { Sheet } from '../ui/Sheet';
import { NAV_LINKS, SECONDARY_LINKS } from './Sidebar';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../lib/auth';
import { ShieldAlert } from 'lucide-react';
import { USE_MOCK } from '../../lib/api';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/spreads': 'Spread Monitor',
  '/prices': 'Normalised Prices',
  '/trade-history': 'Trade History',
  '/curve': 'Term Structure & Carry',
  '/calendar': 'Lifecycle Calendar',
  '/backtest': 'Backtest Lab',
  '/alerts': 'Alerts Terminal',
  '/health': 'Data Health',
  '/about': 'Methodology',
  '/glossary': 'Quantitative Glossary',
  '/faq': 'Help & FAQ',
  '/plans': 'Plans',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/disclaimer': 'Risk Disclaimer',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/welcome': 'Welcome to GoldLens',
  '/admin': 'Admin Risk Desk'
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role } = useUser();

  const pageTitle = PAGE_TITLES[location.pathname] || 'GoldLens';
  const dataDisclaimer = location.pathname === '/backtest'
    ? 'Backtest uses manually imported MCX settlements; other panels remain synthetic and no executable fills are modeled.'
    : 'This panel uses synthetic sample data. Backtest requires manually imported MCX settlements; no live feed or executable fills are connected.';

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-[#F1F5F9] transition-colors relative overflow-x-hidden">
      {/* Ambient glassmorphic glowing orbs in the background */}
      <div className="ambient-mesh" aria-hidden="true">
        <div className="ambient-mesh-orb-1" />
        <div className="ambient-mesh-orb-2" />
        <div className="ambient-mesh-orb-3" />
      </div>

      {/* Skip to Content for Keyboard Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Header */}
      <Header
        pageTitle={pageTitle}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      {USE_MOCK && (
        <div
          role="note"
          className="relative z-20 flex items-center justify-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#111B2E] dark:text-slate-300"
        >
          <span className="font-semibold text-blue-700 dark:text-blue-300">DATA NOTE</span>
          <span aria-hidden="true">·</span>
          <span>{dataDisclaimer}</span>
        </div>
      )}

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Sheet */}
        <Sheet
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          title="GoldLens Navigation"
          position="left"
        >
          <nav className="space-y-1.5 py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
                    isActive
                      ? 'morphic-btn-primary font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}

            <div className="border-t border-slate-200 dark:border-[#1E293B] my-3" />

            {SECONDARY_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E293B]/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 border border-blue-200 dark:border-blue-400/20">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}

            {role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-bold text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/10 min-h-[44px]"
              >
                <ShieldAlert size={18} />
                <span>Admin Desk</span>
              </NavLink>
            )}
          </nav>
        </Sheet>

        {/* Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 outline-hidden">
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

          {/* Footer on Every Page */}
          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />

      {/* Global Utilities */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <FeedbackDialog />
      <PrivacyNotice />
      <OfflineIndicator />
      <ToastContainer />
    </div>
  );
};
