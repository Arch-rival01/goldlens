import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'card' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-slate-800 rounded-lg';

  const variantClasses = {
    text: 'h-4 w-full rounded',
    rectangular: 'h-24 w-full rounded-xl',
    card: 'h-48 w-full rounded-2xl',
    circle: 'rounded-full aspect-square'
  };

  const customStyle: React.CSSProperties = {
    width: width,
    height: height,
    ...style
  };

  return (
    <div
      role="status"
      aria-label="Loading content..."
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={customStyle}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
