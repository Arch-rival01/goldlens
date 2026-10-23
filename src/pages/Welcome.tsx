import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, VolumeX, AlertTriangle, Sliders } from 'lucide-react';
import { useUser } from '../lib/auth';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { MOCK_PAIRS } from '../mock/spreads';

export const Welcome: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [selectedPairs, setSelectedPairs] = useState<string[]>(
    user?.followedPairs || ['GOLDM / GOLDPETAL', 'GOLDM / GOLDTEN']
  );
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'telegram' | 'none'>(
    user?.alertChannel || 'email'
  );

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!acceptedDisclaimer) {
        toast.error('Please accept the analytical research disclaimer to proceed.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      updateUser({
        onboardingDone: true,
        followedPairs: selectedPairs,
        alertChannel: selectedChannel
      });
      toast.success('Onboarding complete. Welcome to GoldLens!', 'Setup Saved');
      navigate('/');
    }
  };

  const handleSkip = () => {
    updateUser({ onboardingDone: true });
    navigate('/');
  };

  const togglePair = (pair: string) => {
    setSelectedPairs((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12 animate-in fade-in duration-150">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                s === step
                  ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {s < step ? <CheckCircle2 size={16} /> : s}
            </div>
          ))}
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-2">
            Step {step} of 3
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-slate-500 hover:text-amber-500 dark:hover:text-amber-400"
        >
          Skip Tour →
        </button>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {/* Step 1: The Core Philosophy */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <VolumeX size={26} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Silence means nothing worth acting on.
            </h2>

            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              GoldLens compares four MCX gold futures contracts (GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL) normalized to 999 fine gold.
            </p>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-sm leading-relaxed">
              <strong className="block font-bold mb-1">Our Core Commitment:</strong>
              Unlike consumer trading platforms that manufacture false urgency, GoldLens protects your capital by enforcing a rigorous 5-gate filter. When the dashboard is calm, that silence is reassuring proof that the market is currently integrated.
            </div>
          </div>
        )}

        {/* Step 2: Risk Disclaimer Acceptance */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={26} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Regulatory & Risk Disclaimer
            </h2>

            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Before exploring relative-value models, you must acknowledge the experimental research nature of this platform.
            </p>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                • <strong>Analytical research prototype:</strong> GoldLens does not provide investment advice or trade execution.
              </p>
              <p>
                • <strong>Synthetic demo dataset:</strong> All displayed quotes and settlements are deterministic simulated models.
              </p>
              <p>
                • <strong>No SEBI registration:</strong> Not registered as an investment adviser or research analyst.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/5 cursor-pointer hover:border-amber-500/60 transition-colors">
              <input
                type="checkbox"
                checked={acceptedDisclaimer}
                onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                className="w-5 h-5 accent-amber-500 rounded mt-0.5 shrink-0"
              />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                I understand and agree: "Analytical research prototype. Not investment advice."
              </span>
            </label>
          </div>
        )}

        {/* Step 3: Choose Followed Pairs & Alert Channel */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center">
              <Sliders size={26} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Choose Pairs & Alert Channel
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose sample spreads for the interface preview. Alert preferences and verified 5-gate notifications are not connected in this demo.
            </p>

            {/* Pairs Selection */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Monitored Pairs (Select all that apply)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOCK_PAIRS.map((pair) => {
                  const isChecked = selectedPairs.includes(pair);
                  return (
                    <div
                      key={pair}
                      onClick={() => togglePair(pair)}
                      className={`p-3 rounded-xl border text-sm font-semibold cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500/10 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <span className="font-mono">{pair}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alert Channel */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Notification Channel
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'email', label: 'Email Digest' },
                  { id: 'telegram', label: 'Telegram (Coming soon)' },
                  { id: 'none', label: 'None (Silent)' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      selectedChannel === ch.id
                        ? 'border-amber-500 bg-amber-500 text-slate-950 font-black shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                        : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              icon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            {step === 3 ? 'Complete Setup & Open Dashboard' : 'Next Step'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
