import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  termKey?: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
  footerNote?: string;
  ariaLabel?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  termKey,
  controls,
  children,
  footerNote,
  ariaLabel,
  className = ''
}) => {
  return (
    <Card className={`flex flex-col ${className}`} role="region" aria-label={ariaLabel || title}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-[#1E293B]">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            {termKey && <Tooltip termKey={termKey} iconOnly />}
            <Badge variant="demo" size="sm">
              Illustrative data
            </Badge>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {controls && <div className="flex items-center gap-2 self-start sm:self-auto">{controls}</div>}
      </div>

      <div className="w-full min-h-[300px] flex-1">
        {children}
      </div>

      {footerNote && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1E293B] text-xs text-gray-500 dark:text-gray-400">
          {footerNote}
        </div>
      )}
    </Card>
  );
};
