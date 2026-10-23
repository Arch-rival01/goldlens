import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in GoldLens:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F172A] text-[#F3F4F6]">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0f1c30] border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <h1 className="text-2xl font-bold text-white">Application Exception</h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              An unexpected client error occurred while rendering the dashboard.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-slate-900 p-3 rounded-lg text-red-300 text-left overflow-x-auto font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                icon={<RefreshCw size={16} />}
                className="w-full"
              >
                Reload Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
