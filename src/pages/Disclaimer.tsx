import React from 'react';
import { AlertOctagon, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Disclaimer: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Risk & Regulatory Disclaimer
          </h1>
          <Badge variant="demo">Demo prototype</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Mandatory compliance notice for Indian bullion and derivative market research.
        </p>
      </div>

      <Card variant="alert" className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400">
            <AlertOctagon size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
            Analytical Research Prototype — Not Investment Advice
          </h2>
        </div>

        <div className="space-y-3 text-base text-gray-800 dark:text-gray-200 leading-relaxed pt-2">
          <p>
            <strong>Commodity derivatives trading carries high risk:</strong> Leveraged futures contracts on the Multi Commodity Exchange of India (MCX) involve substantial risk of financial loss and are not suitable for all investors. You may lose more than your initial deposit.
          </p>
          <p>
            <strong>No SEBI Registration:</strong> GoldLens is an algorithmic research software demo. It is not registered with the Securities and Exchange Board of India (SEBI) as an Investment Adviser (RIA), Research Analyst (RA), or Portfolio Manager. Nothing in this application constitutes financial, legal, tax, or investment advice.
          </p>
          <p>
            <strong>Synthetic Demo Data:</strong> All contract prices, open interest numbers, tick records, and Z-scores displayed in this application are generated from fixed deterministic pseudo-random seeds. They do not reflect live or delayed official MCX exchange prices and must never be used to place actual market orders.
          </p>
        </div>
      </Card>
    </div>
  );
};
