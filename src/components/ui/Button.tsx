import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] min-w-[44px] select-none cursor-pointer';

    const sizeStyles = {
      sm: 'px-3.5 py-2 text-sm gap-1.5 min-h-[44px]',
      md: 'px-4.5 py-2.5 text-base gap-2 min-h-[44px]',
      lg: 'px-6 py-3 text-lg gap-2.5 min-h-[48px]'
    };

    const variantStyles = {
      primary:
        'morphic-btn-primary font-bold',
      secondary:
        'morphic-btn-secondary font-bold dark:bg-slate-800/90 dark:hover:bg-slate-700/90',
      outline:
        'backdrop-blur-md bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-[0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.25)]',
      ghost:
        'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 backdrop-blur-xs',
      danger:
        'morphic-btn-danger font-bold',
      teal:
        'morphic-btn-teal font-bold',
      glass:
        'backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white/95 dark:hover:bg-slate-700/90 shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        {children}
        {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
