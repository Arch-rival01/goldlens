import React from 'react';
import { Card } from './Card';
import { Tooltip } from './Tooltip';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: number; // e.g. percentage or bps
  changeLabel?: string;
  icon?: React.ReactNode;
  termKey?: string;
  variant?: 'default' | 'calm-teal' | 'warning' | 'alert' | 'highlight' | 'frosted-gold';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  change,
  changeLabel,
  icon,
  termKey,
  variant = 'default',
  className = ''
}) => {
  return (
    <Card
      variant={variant}
      hoverEffect
      className={`flex flex-col justify-between group ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-sm font-semibold tracking-wide">
          <span>{label}</span>
          {termKey && <Tooltip termKey={termKey} iconOnly />}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1E293B]/80 border border-slate-200/60 dark:border-[#1E293B] text-slate-700 dark:text-slate-200 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] shadow-[0_4px_12px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="my-1.5">
        <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight tabular-nums drop-shadow-xs">
          {value}
        </div>
      </div>

      {(subtext || change !== undefined) && (
        <div className="mt-2 flex items-center flex-wrap gap-2 text-xs sm:text-sm">
          {change !== undefined && (
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                change > 0
                  ? 'bg-[#0D9488]/15 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0D9488]/30'
                  : change < 0
                  ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-400/30'
              }`}
            >
              {change > 0 && <ArrowUpRight size={14} className="mr-0.5" />}
              {change < 0 && <ArrowDownRight size={14} className="mr-0.5" />}
              {change === 0 && <Minus size={14} className="mr-0.5" />}
              {change > 0 ? `+${change}` : change}
              {changeLabel || '%'}
            </span>
          )}
          {subtext && (
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
