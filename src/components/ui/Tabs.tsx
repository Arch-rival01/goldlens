import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline' | 'buttons';
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
  size = 'md'
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        variant === 'underline'
          ? 'border-b border-slate-200/80 dark:border-white/10'
          : 'morphic-tray p-1.5 rounded-2xl backdrop-blur-md'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        const baseItemStyles =
          'inline-flex items-center justify-center font-semibold transition-all duration-200 min-h-[44px] px-4 py-2 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 rounded-xl';

        const sizeStyles = size === 'sm' ? 'text-sm gap-1.5' : 'text-base gap-2';

        const styleVariants = {
          underline: isActive
            ? 'text-blue-700 dark:text-blue-300 font-semibold border-b-2 border-blue-600 dark:border-blue-400 rounded-b-none'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
          pill: isActive
            ? 'morphic-floating-pill text-slate-950 dark:text-white font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-[#1E293B]/70',
          buttons: isActive
            ? 'morphic-btn-primary font-bold'
            : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-[#1E293B]/60'
        };

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`${baseItemStyles} ${sizeStyles} ${styleVariants[variant]}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-200'
                    : 'bg-slate-200/80 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
