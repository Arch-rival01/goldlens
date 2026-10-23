import React, { useState } from 'react';
import { MessageSquare, Star, Send } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';

export const FeedbackDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      setMessage('');
      setEmail('');
      toast.success(
        'Thank you for your feedback! Your notes help calibrate our quantitative models.',
        'Feedback Recorded'
      );
    }, 400);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Give feedback on GoldLens"
        className="fixed bottom-20 sm:bottom-6 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#2563EB] dark:bg-slate-800 text-white shadow-md hover:bg-[#1D4ED8] dark:hover:bg-slate-700 border border-blue-700/30 transition-all active:scale-95 text-xs sm:text-sm font-semibold min-h-[44px] min-w-[44px]"
      >
        <MessageSquare size={17} className="text-blue-600 dark:text-blue-300" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Share Analytical Feedback"
        description="Help us refine GoldLens contract models, spread gates, and execution filters."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
              How would you rate GoldLens data clarity?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star rating`}
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 focus-visible:outline-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Star
                    size={28}
                    className={
                      star <= rating
                        ? 'fill-blue-600 text-blue-600 dark:fill-blue-300 dark:text-blue-300'
                        : 'text-gray-300 dark:text-slate-700'
                    }
                  />
                </button>
              ))}
              <span className="text-sm font-medium text-slate-500 ml-2">
                {rating === 5 ? 'Excellent' : rating >= 3 ? 'Good' : 'Needs tuning'}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Feedback or bug observation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g. The 5-gate tender cutoff is clear, but consider adding 15-minute delayed tick alert support..."
              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="feedback-email"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5"
            >
              Optional contact email
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fund.com"
              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Send size={16} />}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
};
