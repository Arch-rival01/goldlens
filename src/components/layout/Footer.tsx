import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-[#080C14]/80 backdrop-blur-2xl text-slate-700 dark:text-slate-300 transition-colors pb-20 md:pb-6 pt-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
              Research & Strategy
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="hover:text-amber-500 transition-colors">
                  Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/spreads" className="hover:text-amber-500 transition-colors">
                  Spread Monitor (Z-Score)
                </Link>
              </li>
              <li>
                <Link to="/prices" className="hover:text-amber-500 transition-colors">
                  Normalised Prices (999 Fine)
                </Link>
              </li>
              <li>
                <Link to="/trade-history" className="hover:text-amber-500 transition-colors">
                  Trade History
                </Link>
              </li>
              <li>
                <Link to="/curve" className="hover:text-amber-500 transition-colors">
                  Term Structure & Carry
                </Link>
              </li>
              <li>
                <Link to="/backtest" className="hover:text-amber-500 transition-colors">
                  Backtest Lab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
              Operations & Rules
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/calendar" className="hover:text-amber-500 transition-colors">
                  Lifecycle Calendar & Tender
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-amber-500 transition-colors">
                  Alerts Terminal
                </Link>
              </li>
              <li>
                <Link to="/health" className="hover:text-amber-500 transition-colors">
                  Data Health & Tick Logs
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
                  <span>Pro Plans</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                    Coming soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
              Method & Help
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">
                  About & 5-Gate Method
                </Link>
              </li>
              <li>
                <Link to="/glossary" className="hover:text-amber-500 transition-colors">
                  Quantitative Glossary
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-amber-500 transition-colors">
                  Help & Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/welcome" className="hover:text-amber-500 transition-colors">
                  Product Welcome Tour
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
              Compliance & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-amber-500 transition-colors">
                  Risk Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-amber-500 transition-colors">
                  Settings & Data Export
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer Notice */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span>Analytical research prototype. Not investment advice.</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            GoldLens evaluates synthetic relative-value dislocations between MCX gold contracts (GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL). Past statistical mean reversion is no guarantee of future returns. All prices are calculated on demo seeds.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
            &copy; 2026 GoldLens Research. "Same gold, four prices, one honest answer."
          </p>
        </div>
      </div>
    </footer>
  );
};
