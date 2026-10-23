import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Activity, Calendar, GitCompare, Shield, Settings, BookOpen, Layers, X, Sparkles, History } from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  category: 'Navigation' | 'Pairs' | 'Documentation' | 'Account';
  icon: React.ReactNode;
}

const ITEMS: PaletteItem[] = [
  { id: 'overview', title: 'Overview Dashboard', subtitle: 'Calm status, 4 contracts, sparklines & summary', path: '/', category: 'Navigation', icon: <Compass size={18} /> },
  { id: 'spreads', title: 'Spread Monitor', subtitle: 'Z-score tracking & friction hurdles across 5 pairs', path: '/spreads', category: 'Navigation', icon: <GitCompare size={18} /> },
  { id: 'prices', title: 'Normalised Prices', subtitle: '999 pure gold INR/g basis comparison', path: '/prices', category: 'Navigation', icon: <Activity size={18} /> },
  { id: 'trade-history', title: 'Trade History', subtitle: 'One-year sample buy and sell records', path: '/trade-history', category: 'Navigation', icon: <History size={18} /> },
  { id: 'curve', title: 'Term Structure & Carry', subtitle: 'Futures forward curve and roll-down decomposition', path: '/curve', category: 'Navigation', icon: <Layers size={18} /> },
  { id: 'calendar', title: 'Lifecycle Calendar', subtitle: 'Tender periods, peak OI, and rollover horizons', path: '/calendar', category: 'Navigation', icon: <Calendar size={18} /> },
  { id: 'backtest', title: 'Backtest Lab', subtitle: 'Empirical scenario metrics and Sharpe ratios', path: '/backtest', category: 'Navigation', icon: <Sparkles size={18} /> },
  { id: 'alerts', title: 'Alerts Terminal', subtitle: 'Sample signals and illustrative outcomes', path: '/alerts', category: 'Navigation', icon: <Shield size={18} /> },
  { id: 'health', title: 'Data Health', subtitle: 'Illustrative quality checks and sample rejected rows', path: '/health', category: 'Navigation', icon: <Activity size={18} /> },
  { id: 'pair-m-petal', title: 'Pair: GOLDM / GOLDPETAL', subtitle: 'Institutional benchmark vs micro-retail 1g', path: '/spreads?pair=GOLDM%20%2F%20GOLDPETAL', category: 'Pairs', icon: <GitCompare size={18} /> },
  { id: 'pair-m-ten', title: 'Pair: GOLDM / GOLDTEN', subtitle: '100g mini vs 10g high-purity contract', path: '/spreads?pair=GOLDM%20%2F%20GOLDTEN', category: 'Pairs', icon: <GitCompare size={18} /> },
  { id: 'pair-ten-guinea', title: 'Pair: GOLDTEN / GOLDGUINEA', subtitle: '10g standard vs 8g sovereign guinea', path: '/spreads?pair=GOLDTEN%20%2F%20GOLDGUINEA', category: 'Pairs', icon: <GitCompare size={18} /> },
  { id: 'pair-guinea-petal', title: 'Pair: GOLDGUINEA / GOLDPETAL', subtitle: 'Retail 8g coin vs 1g petal', path: '/spreads?pair=GOLDGUINEA%20%2F%20GOLDPETAL', category: 'Pairs', icon: <GitCompare size={18} /> },
  { id: 'about', title: 'About & Methodology', subtitle: 'Research principles and 5-gate pipeline', path: '/about', category: 'Documentation', icon: <BookOpen size={18} /> },
  { id: 'glossary', title: 'Quantitative Glossary', subtitle: 'Bps, Z-score, roll-down, carry, half-life', path: '/glossary', category: 'Documentation', icon: <BookOpen size={18} /> },
  { id: 'faq', title: 'Help & FAQ', subtitle: 'Exchange mechanics and frequently asked questions', path: '/faq', category: 'Documentation', icon: <BookOpen size={18} /> },
  { id: 'settings', title: 'Settings', subtitle: 'Profile, alert channels and quiet hours', path: '/settings', category: 'Account', icon: <Settings size={18} /> }
];

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: PaletteItem) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command search palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200/80 dark:border-[#1E293B] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-[#1E293B]">
          <Search size={20} className="text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, pairs (e.g. GOLDM, Spreads, Glossary)..."
            className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden font-medium"
          />
          <button
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching pages or pairs found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#2563EB]/10 text-slate-900 dark:text-white border-l-4 border-[#2563EB]'
                      : 'hover:bg-slate-100 dark:hover:bg-[#1E293B]/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-transform ${
                      isSelected
                        ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-[#1E293B] text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-base truncate">{item.title}</span>
                      <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-[#090D16] text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#1E293B]">
          <span>
            Navigate with <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">↑</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">↓</kbd>
          </span>
          <span>
            Select with <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Enter</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
