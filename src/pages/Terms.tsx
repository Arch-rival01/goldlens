import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Terms: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <Badge variant="demo">Demo prototype</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Terms governing the use of the GoldLens research terminal prototype.
        </p>
      </div>

      <Card className="p-6 space-y-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          1. Research Prototype License
        </h2>
        <p>
          GoldLens is provided strictly for academic analysis, educational modeling, and interface prototyping. You agree to use the software solely to evaluate quantitative spread concepts.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-2">
          2. No Brokerage or Trading Execution
        </h2>
        <p>
          GoldLens is not an exchange, registered stockbroker, SEBI-registered investment advisor, or portfolio manager. The platform cannot place orders, hold collateral, or execute trades on MCX or any exchange.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-2">
          3. Limitation of Liability
        </h2>
        <p>
          Under no circumstances shall GoldLens or its contributors be liable for any direct, indirect, incidental, or consequential trading losses resulting from reliance on the simulated models, spread alerts, or mathematical normalization formulas displayed.
        </p>
      </Card>
    </div>
  );
};
