import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load analytical dataset',
  message = 'An unexpected error occurred while fetching contract series. You can retry safely.',
  onRetry,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`rounded-2xl border-2 border-blue-200 dark:border-blue-400/20 bg-blue-50/70 dark:bg-blue-400/5 p-6 sm:p-8 text-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
          icon={<RefreshCw size={18} />}
          className="mx-auto"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
