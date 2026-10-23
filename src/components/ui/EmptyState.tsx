import React from 'react';
import { Database, Filter } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 p-8 sm:p-12 text-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
        {icon || <Database size={28} />}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} icon={<Filter size={18} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
