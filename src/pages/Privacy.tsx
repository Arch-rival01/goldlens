import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Privacy: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <Badge variant="demo">Demo prototype</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Last updated: October 2026. How GoldLens handles prototype analytics data and browser storage.
        </p>
      </div>

      <Card className="p-6 space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          1. Local-Only Storage
        </h2>
        <p>
          GoldLens is an analytical frontend prototype. All user settings, followed contract pairs, quiet hour parameters, and appearance preferences are stored strictly in your browser’s <code>localStorage</code>. No personal profile data or server-side cookies are transmitted to third-party advertising networks.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-2">
          2. No Real Account Credentials
        </h2>
        <p>
          Authentication on GoldLens is an in-memory simulation. Passwords, actual Google OAuth tokens, or payment card details are never requested, stored, or processed.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-2">
          3. Analytics & Diagnostics
        </h2>
        <p>
          No invasive cross-site tracking telemetry or third-party advertising cookies are embedded. Prototype performance metrics remain isolated within your local browser execution context.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-2">
          4. Data Export & Deletion
        </h2>
        <p>
          You retain complete ownership over your configuration. You can export all saved parameters in JSON format or trigger instant local purging from our Settings page at any time.
        </p>
      </Card>
    </div>
  );
};
