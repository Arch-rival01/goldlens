import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'demo' | 'success' | 'warning' | 'danger' | 'navy' | 'amber' | 'slate' | 'neutral' | 'glass';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 font-semibold gap-1 min-h-[22px]',
    md: 'text-xs sm:text-sm px-3 py-1 font-bold gap-1.5 min-h-[26px]'
  };

  const variantClasses = {
    demo: 'bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 border border-blue-200 dark:border-blue-400/20',
    success: 'backdrop-blur-md bg-[#0D9488]/15 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0D9488]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
    warning: 'bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200 border border-blue-200 dark:border-blue-400/20',
    danger: 'backdrop-blur-md bg-rose-500/15 text-rose-950 dark:text-rose-300 border border-rose-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
    navy: 'backdrop-blur-md bg-[#1E293B]/70 dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    amber: 'bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300 border border-blue-200 dark:border-blue-400/20',
    slate: 'backdrop-blur-md bg-slate-500/15 text-slate-800 dark:text-slate-300 border border-slate-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    neutral: 'backdrop-blur-md bg-slate-200/70 dark:bg-[#1E293B]/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    glass: 'backdrop-blur-md bg-white/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white border border-white/60 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
