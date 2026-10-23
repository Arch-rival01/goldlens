import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Proposed Methodology & Research Workflow
          </h1>
          <Badge variant="demo">Demo data - not market data</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          "Same gold, four prices, one honest answer." This page describes a proposed analytical workflow; the current frontend uses synthetic fixtures and does not run the pipeline.
        </p>
      </div>

      {/* Abstract */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          1. The Structural Puzzle of Indian Gold Futures
        </h2>
        <div className="space-y-3 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            India’s Multi Commodity Exchange (MCX) lists four simultaneous futures contracts on the exact same underlying metal—pure physical gold:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 font-medium">
            <li><strong>GOLDM (Mini):</strong> 100g lot, quoted per 10g, 995 purity</li>
            <li><strong>GOLDTEN:</strong> 10g lot, quoted per 10g, 999 purity</li>
            <li><strong>GOLDGUINEA:</strong> 8g lot, quoted per 8g, 999 purity</li>
            <li><strong>GOLDPETAL:</strong> 1g lot, quoted per 1g, 999 purity</li>
          </ul>
          <p>
            Despite sharing identical macroeconomic drivers (global spot gold, USD/INR currency exchange, customs duty, and RBI interest rates), these contracts frequently diverge in normalized price per gram. Retail buying spikes smaller denominations, while institutional desks anchor the 100g benchmark.
          </p>
        </div>
      </Card>

      {/* The 5 Gates */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          2. Proposed 5-Gate Filter Pipeline (Not Implemented)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          These are workflow design requirements, not checks currently executed by the frontend. No live quotes, order book, fee schedule, or tender calendar is connected.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <h3 className="font-semibold text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" /> Gate 1: Cost Hurdle Gate
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              The planned model would estimate costs for both legs, statutory charges, and slippage. Fee inputs must be verified against current official schedules; this demo does not calculate live costs.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <h3 className="font-semibold text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" /> Gate 2: Bid-Ask Slippage Feasibility
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              The planned gate would require current bid-ask quotes and suppress a trade when the quote width exceeds a configured tolerance. No quote feed is connected.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <h3 className="font-semibold text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" /> Gate 3: Liquidity Depth Score (≥60)
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              A future implementation could use order-book depth to estimate market impact. The frontend does not receive or evaluate order-book data.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <h3 className="font-semibold text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" /> Gate 4: Tender Period Clearance (&gt;5 Days)
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              The proposed workflow excludes contracts within a configured number of sessions from tender commencement. Dates and exchange rules must be checked against current official contract specifications.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <h3 className="font-semibold text-base text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0D9488] dark:text-[#2DD4BF]" /> Gate 5: Half-Life Decay Bound (&lt;14 Days)
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              The proposed workflow would estimate mean-reversion half-life and enforce a configured maximum holding horizon. No regression is run in this frontend demo.
            </p>
          </div>
        </div>
      </Card>

      {/* Why Silence is Reassuring */}
      <Card variant="calm-teal" className="p-6">
        <h2 className="text-xl font-bold text-teal-950 dark:text-teal-100 mb-2">
          3. The Philosophy of Silence
        </h2>
        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
          The future product is designed to avoid encouraging trades without sufficient evidence. In the current demo, the quiet state and sample alert are fixtures—not a conclusion about today's market.
        </p>
        <p className="text-sm text-teal-900 dark:text-teal-300 font-semibold mt-2">
          Live risk checks and market-data validation must be implemented before this workflow can be relied on.
        </p>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Link to="/glossary">
          <Button variant="outline" icon={<BookOpen size={16} />}>
            Explore Quantitative Glossary
          </Button>
        </Link>
        <Link to="/backtest">
          <Button variant="primary" icon={<ArrowRight size={16} />} iconPosition="right">
            Inspect Backtest Results
          </Button>
        </Link>
      </div>
    </div>
  );
};
