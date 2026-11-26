import React, { createContext, useContext, useState } from 'react';

export type ToastKind = 'error' | 'success';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
  visible: boolean;
}

// Default kind is 'error' so existing toast(msg) calls keep their meaning; pass 'success' for good news.
type ToastFn = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const STYLES: Record<ToastKind, string> = {
  error: 'bg-red-600 text-white',
  success: 'bg-emerald-600 text-white',
};

let nextId = 0;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast: ToastFn = (message, kind = 'error') => {
    const id = ++nextId; // Date.now() collided when two toasts fired in the same millisecond
    setToasts(t => [...t, { id, message, kind, visible: true }]);
    setTimeout(() => {
      setToasts(t => t.map(toast => toast.id === id ? { ...toast, visible: false } : toast));
    }, 2500);
    setTimeout(() => {
      setToasts(t => t.filter(toast => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            // Errors interrupt screen readers; successes are announced politely.
            role={t.kind === 'error' ? 'alert' : 'status'}
            aria-live={t.kind === 'error' ? 'assertive' : 'polite'}
            data-kind={t.kind}
            className={`${STYLES[t.kind]} px-3 py-2 rounded shadow transition-all duration-500 transform ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
