import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'calm-teal' | 'warning' | 'alert' | 'highlight' | 'frosted-gold';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden';

  const variantStyles = {
    default:
      'bg-white/90 dark:bg-[#0F172A]/90 border border-slate-200/90 dark:border-[#1E293B] text-slate-900 dark:text-slate-100 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.38)]',
    'calm-teal':
      'bg-teal-50/80 dark:bg-[#042F2E]/35 border border-[#0D9488]/40 text-teal-950 dark:text-teal-200 shadow-[0_10px_32px_rgba(13,148,136,0.15)] shadow-inner-[inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-inner-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
    warning:
      'bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-400/25 text-blue-950 dark:text-blue-200 shadow-[0_8px_24px_rgba(37,99,235,0.08)]',
    alert:
      'bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-400/25 text-blue-950 dark:text-blue-200 shadow-[0_8px_24px_rgba(37,99,235,0.08)]',
    highlight:
      'bg-blue-50/80 dark:bg-[#1E293B]/60 border border-blue-500/40 text-slate-900 dark:text-slate-100 shadow-[0_10px_32px_rgba(59,130,246,0.15)] shadow-inner-[inset_0_1px_2px_rgba(255,255,255,0.8)] dark:shadow-inner-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
    'frosted-gold':
      'bg-white/90 dark:bg-[#111B2E]/90 border border-blue-200 dark:border-blue-400/20 text-slate-900 dark:text-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.45)]'
  };

  const hoverClass = hoverEffect
    ? 'hover:border-blue-300 dark:hover:border-blue-400/40 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] cursor-pointer'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {/* Specular light highlight top edge reflection */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 dark:via-white/20 to-transparent"
        aria-hidden="true"
      />
      {children}
    </div>
  );
};
