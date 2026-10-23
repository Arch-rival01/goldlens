import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  tooltipTermKey?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  caption?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found',
  caption,
  className = ''
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 glass-panel rounded-2xl border border-slate-200/60 dark:border-white/10">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* Desktop & Tablet Table (>=640px) */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-lg">
        <table className="w-full text-left border-collapse text-[15px] tabular-nums">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-[#1E293B] bg-slate-50/70 dark:bg-[#1E293B]/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 tracking-wide ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/50">
            {data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]/40 transition-colors"
              >
                {columns.map((col) => {
                  const val = (row as Record<string, unknown>)[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 text-slate-900 dark:text-slate-100 font-normal ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, idx) : (val as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (<640px) */}
      <div className="sm:hidden space-y-3">
        {data.map((row, idx) => (
          <div
            key={keyExtractor(row, idx)}
            className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.06)] space-y-2.5 tabular-nums"
          >
            {columns.map((col) => {
              const val = (row as Record<string, unknown>)[col.key];
              return (
                <div
                  key={col.key}
                  className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {col.header}
                  </span>
                  <span className="text-[15px] font-medium text-slate-900 dark:text-slate-100 text-right">
                    {col.render ? col.render(row, idx) : (val as React.ReactNode)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
