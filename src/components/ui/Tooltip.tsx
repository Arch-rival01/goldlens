import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../../lib/glossary';

export interface TooltipProps {
  termKey?: keyof typeof GLOSSARY_TERMS | string;
  customTerm?: GlossaryTerm;
  children?: React.ReactNode;
  iconOnly?: boolean;
  label?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  termKey,
  customTerm,
  children,
  iconOnly = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const termData: GlossaryTerm | undefined =
    customTerm || (termKey ? GLOSSARY_TERMS[termKey] : undefined);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!termData) {
    return <>{children || label}</>;
  }

  return (
    <span ref={containerRef} className="relative inline-flex items-center align-middle">
      <button
        type="button"
        aria-label={`Definition for ${termData.term}`}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1 text-inherit hover:text-blue-600 dark:hover:text-blue-300 focus-visible:outline-2 focus-visible:outline-blue-600 rounded px-0.5 group min-h-[32px] min-w-[32px] justify-center transition-colors"
      >
        {!iconOnly && (
          <span className="border-b border-dotted border-slate-400 dark:border-slate-500 font-medium">
            {children || label || termData.term}
          </span>
        )}
        <Info
          size={16}
          className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors shrink-0"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={termData.term}
          className="fixed inset-x-4 top-20 z-50 sm:absolute sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-full sm:mb-2 w-auto max-w-[92vw] sm:w-80 p-4 rounded-2xl glass-panel bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 dark:border-[#1E293B] pb-2 mb-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300 block">
                Concept definition
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {termData.term}
              </h4>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close tooltip"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
            {termData.shortDefinition}
          </p>

          {termData.formula && (
            <div className="bg-slate-100 dark:bg-[#1E293B]/80 rounded-lg p-2.5 mb-2 font-mono text-xs text-blue-950 dark:text-blue-300 border border-slate-200 dark:border-[#1E293B] overflow-x-auto">
              <code>{termData.formula}</code>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 italic">
            {termData.detailedExplanation}
          </p>

          <div className="bg-blue-50 dark:bg-blue-400/10 border-l-2 border-blue-500 p-2.5 text-xs text-blue-900 dark:text-blue-200 rounded-r-lg">
            <span className="font-bold block text-blue-700 dark:text-blue-300 mb-0.5">Practical MCX context:</span>
            {termData.practicalExample}
          </div>
        </div>
      )}
    </span>
  );
};
