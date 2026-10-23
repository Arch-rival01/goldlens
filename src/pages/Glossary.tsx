import React, { useState } from 'react';
import { Search, BookOpen, HelpCircle } from 'lucide-react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../lib/glossary';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Glossary: React.FC = () => {
  const [search, setSearch] = useState('');
  const termsList = Object.values(GLOSSARY_TERMS);

  const filtered = termsList.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(search.toLowerCase()) ||
      t.detailedExplanation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Quantitative Bullion Glossary
          </h1>
          <Badge variant="demo">Demo data - not market data</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Plain-English reference for statistical arbitrage, microstructure friction, and MCX mechanics.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms (e.g. basis point, z-score, roll-down, carry, tender)..."
          className="w-full rounded-2xl border border-slate-300 dark:border-[#1E293B] bg-white/80 dark:bg-[#0F172A]/80 pl-12 pr-4 py-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-sm backdrop-blur-xl"
        />
      </div>

      {/* Glossary Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <Card key={item.key} id={item.key} className="p-5 sm:p-6 space-y-3 glass-panel">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E293B] pb-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {item.term}
              </h2>
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                {item.key}
              </span>
            </div>

            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {item.shortDefinition}
            </p>

            {item.formula && (
              <div className="p-3 bg-slate-100/80 dark:bg-[#1E293B]/80 rounded-xl border border-slate-200 dark:border-[#1E293B] font-mono text-xs sm:text-sm text-blue-950 dark:text-blue-300 overflow-x-auto">
                <code>{item.formula}</code>
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.detailedExplanation}
            </p>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-400/10 border-l-4 border-blue-500 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
              <span className="font-semibold block mb-0.5 text-blue-700 dark:text-blue-300">MCX Application Example:</span>
              {item.practicalExample}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
