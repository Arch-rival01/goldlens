import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('goldlens_privacy_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('goldlens_privacy_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and prototype notice"
      className="fixed bottom-20 sm:bottom-4 inset-x-4 sm:left-auto sm:right-4 max-w-lg z-40 p-4 rounded-2xl bg-white dark:bg-[#0f1c30] border-2 border-slate-300 dark:border-slate-700 shadow-2xl text-gray-900 dark:text-gray-100 animate-in slide-in-from-bottom duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
          <Shield size={20} />
        </div>
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-semibold text-gray-900 dark:text-white mb-0.5">
            Privacy & Analytical Research Notice
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
            GoldLens stores preferences locally in your browser session. All contract data is for prototype demonstration.
            Read our{' '}
            <Link to="/privacy" className="text-blue-700 dark:text-blue-300 underline font-medium hover:text-blue-800 dark:hover:text-blue-200">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/disclaimer" className="text-blue-700 dark:text-blue-300 underline font-medium hover:text-blue-800 dark:hover:text-blue-200">
              Risk Disclaimer
            </Link>.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss privacy notice"
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </aside>
  );
};
