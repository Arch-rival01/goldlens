import React, { useState, useEffect } from 'react';
import { Download, Check, Share2 } from 'lucide-react';
import { Dialog } from '../ui/Dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold px-2 py-1 bg-teal-50 dark:bg-teal-950/40 rounded-lg">
        <Check size={14} /> Installed
      </span>
    );
  }

  // Show button if installable or iOS
  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install GoldLens PWA application"
        className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-amber-400 dark:border-amber-600/70 bg-amber-500/10 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 active:scale-95 transition-all min-h-[44px] min-w-[44px] ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        }`}
        title="Install GoldLens app to home screen"
      >
        <Download size={15} className="text-blue-600 dark:text-blue-300" />
        <span>Install PWA</span>
      </button>

      <Dialog
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
        title="Install GoldLens on iPhone / iPad"
      >
        <div className="space-y-4 text-base text-gray-700 dark:text-gray-300">
          <p>
            Apple iOS requires manual addition to the home screen from Safari:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
            <li>
              Tap the <strong className="text-gray-900 dark:text-white">Share</strong> icon (
              <Share2 size={16} className="inline mx-1 text-blue-500" />) in Safari's bottom toolbar.
            </li>
            <li>
              Scroll down the menu and select <strong className="text-gray-900 dark:text-white">Add to Home Screen</strong>.
            </li>
            <li>
              Tap <strong className="text-blue-700 dark:text-blue-300">Add</strong> in the top right to launch GoldLens full-screen without address bars.
            </li>
          </ol>
        </div>
      </Dialog>
    </>
  );
};
