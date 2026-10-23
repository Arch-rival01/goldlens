import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Does the sample quiet state describe today’s market?',
    answer:
      'No. The current frontend uses synthetic fixtures and does not evaluate live quotes, costs, or alert gates. The quiet state is an illustrative UI scenario, not evidence about current market conditions.'
  },
  {
    question: 'How do you compare 995 purity GOLDM with 999 purity GOLDTEN?',
    answer:
      'The frontend sample applies the purity conversion to show a 999-fineness INR-per-gram comparison: normalized GOLDM = settlement per 10g ÷ 10 × (999 / 995). This corrects the purity basis only; it does not adjust for expiry, carry, costs, or premiums.'
  },
  {
    question: 'What happens during the Tender Period?',
    answer:
      'The proposed workflow includes a pre-tender exclusion gate. The frontend demo does not verify official tender dates or automatically quarantine live contracts; check current MCX contract specifications.'
  },
  {
    question: 'What fees are included in the Cost Hurdle Band?',
    answer:
      'The workflow proposes including statutory charges and bid-ask costs, but this demo does not load a verified current fee schedule or live order-book data. Confirm applicable charges from official sources before any analysis.'
  },
  {
    question: 'Is GoldLens an investment advisory service?',
    answer:
      'No. GoldLens is an analytical research prototype for quantitative research and educational demonstration. It does not provide trading recommendations, advisory services, or portfolio management. All data displayed uses synthetic deterministic demo models.'
  },
  {
    question: 'What is the structural difference between GOLDGUINEA and GOLDTEN?',
    answer:
      'The sample contract metadata describes GOLDTEN as a 10-gram 999-fineness contract and GOLDGUINEA as an 8-gram 999-fineness contract. Verify lot sizes, purity, and contract specifications against current official sources.'
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      <div>
        <div className="flex items-center flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Help & Frequently Asked Questions
          </h1>
          <Badge variant="demo">Demo data - not market data</Badge>
        </div>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-1">
          Detailed guidance on contract mechanics, statistical filters, and relative-value trading.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card key={faq.question} className="overflow-hidden p-0 border border-gray-200 dark:border-slate-800">
              <button
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors min-h-[44px]"
              >
                <span className="text-base sm:text-lg pr-4">{faq.question}</span>
                <span className="p-1 rounded-lg text-gray-400 shrink-0">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-slate-800/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
