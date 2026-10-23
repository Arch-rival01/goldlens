import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'left' | 'right';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom'
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionStyles = {
    bottom: 'inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] animate-in slide-in-from-bottom duration-200',
    left: 'inset-y-0 left-0 w-80 max-w-[85vw] rounded-r-2xl animate-in slide-in-from-left duration-200',
    right: 'inset-y-0 right-0 w-80 max-w-[85vw] rounded-l-2xl animate-in slide-in-from-right duration-200'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed backdrop-blur-2xl bg-white/90 dark:bg-[#0c1626]/90 border border-white/80 dark:border-white/15 text-gray-900 dark:text-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-y-auto p-6 ${positionStyles[position]}`}
      >
        <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
          {title ? (
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          ) : (
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto" />
          )}
          <button
            onClick={onClose}
            aria-label="Close sheet"
            className="p-2 -mr-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
