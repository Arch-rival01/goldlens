import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

type ToastListener = (toasts: ToastMessage[]) => void;
let toastQueue: ToastMessage[] = [];
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string, title?: string) => {
    addToast({ id: String(Date.now() + Math.random()), type: 'success', message, title });
  },
  error: (message: string, title?: string) => {
    addToast({ id: String(Date.now() + Math.random()), type: 'error', message, title });
  },
  info: (message: string, title?: string) => {
    addToast({ id: String(Date.now() + Math.random()), type: 'info', message, title });
  }
};

function addToast(item: ToastMessage) {
  toastQueue = [...toastQueue, item];
  listeners.forEach((l) => l(toastQueue));

  setTimeout(() => {
    removeToast(item.id);
  }, 4500);
}

function removeToast(id: string) {
  toastQueue = toastQueue.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toastQueue));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastQueue);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom duration-200 ${
            t.type === 'success'
              ? 'bg-teal-900 text-teal-50 border-teal-600'
              : t.type === 'error'
              ? 'bg-red-900 text-red-50 border-red-600'
              : 'bg-[#0F172A] text-blue-50 border-slate-700'
          }`}
        >
          <span className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 size={18} className="text-teal-300" />}
            {t.type === 'error' && <AlertCircle size={18} className="text-red-300" />}
            {t.type === 'info' && <Info size={18} className="text-blue-300" />}
          </span>
          <div className="flex-1">
            {t.title && <div className="font-bold text-base mb-0.5">{t.title}</div>}
            <div>{t.message}</div>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/70 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
