import React, { useState } from 'react';
import { Check, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';

export const Plans: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.info('Preview only. Your email was not submitted; no waitlist is connected.', 'Not submitted');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-150">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="warning" className="mb-2">
          Concept preview
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Institutional & Desk Subscription Plans
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2">
          GoldLens is currently an analytical frontend prototype. A live WebSocket feed and Telegram notifications are possible future integrations, not active or scheduled services.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Plan names, feature lists, and prices below are mockups; subscriptions and waitlist submission are not connected.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Tier 1: Free Research */}
        <Card className="flex flex-col justify-between p-6 border-2 border-gray-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Community Access
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              Free Research
            </h3>
            <div className="my-4">
              <span className="text-3xl font-black text-gray-900 dark:text-white">₹0</span>
              <span className="text-xs text-gray-500 ml-1">/ forever</span>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Daily settlement EOD data</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Basic 5-gate spread monitor</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Web-based terminal dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Glossary and methodology docs</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button variant="outline" className="w-full" disabled>
              Prototype access
            </Button>
          </div>
        </Card>

        {/* Tier 2: Desk Pro */}
        <Card variant="frosted-gold" className="flex flex-col justify-between p-6 border border-blue-200 dark:border-blue-400/20 relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <Badge variant="warning" size="sm">
              Concept
            </Badge>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Professional Traders
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Desk Pro
            </h3>
            <div className="my-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">₹2,999</span>
              <span className="text-xs text-slate-500 ml-1">/ month</span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 dark:text-blue-300" />
                <span>Instant Telegram breach notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 dark:text-blue-300" />
                <span>1-minute tick refresh frequency</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 dark:text-blue-300" />
                <span>Custom Z-Score & cost hurdle thresholds</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 dark:text-blue-300" />
                <span>Daily PDF analytical tear-sheet export</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-400/20">
            <Button variant="primary" className="w-full" disabled>
              Not available
            </Button>
          </div>
        </Card>

        {/* Tier 3: Institutional API */}
        <Card className="flex flex-col justify-between p-6 border-2 border-gray-200 dark:border-slate-800 relative">
          <div className="absolute top-3 right-3">
            <Badge variant="warning" size="sm">
              Concept
            </Badge>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Funds & Desks
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              Institutional API
            </h3>
            <div className="my-4">
              <span className="text-3xl font-black text-gray-900 dark:text-white">₹14,999</span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Low-latency REST / WebSocket API</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Full tick historical database (5 years)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Custom OMS / FIX protocol integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-teal-500" />
                <span>Dedicated quantitative risk engineer</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button variant="outline" className="w-full" disabled>
              Not available
            </Button>
          </div>
        </Card>
      </div>

      {/* Early Access Waitlist Form */}
      <Card className="p-6 text-center max-w-xl mx-auto space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Waitlist Form Preview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This example form does not send or store your email. A real waitlist service is not connected.
        </p>
        <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter institutional email..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#1E293B] px-3.5 py-2.5 text-base text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
          <Button type="submit" variant="primary">
            Preview Only
          </Button>
        </form>
      </Card>
    </div>
  );
};
