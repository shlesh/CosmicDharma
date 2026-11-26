import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/util/cn';

export type ToastKind = 'error' | 'success';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

// The default kind is 'error' so a bare toast(msg) keeps its meaning; pass 'success' for good news.
type ToastFn = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const DURATION_MS = 4500;
let nextId = 0;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const addToast: ToastFn = useCallback(
    (message, kind = 'error') => {
      const id = ++nextId; // a counter, so two toasts in the same millisecond don't collide
      setToasts((all) => [...all.slice(-3), { id, message, kind }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS));
    },
    [dismiss],
  );

  useEffect(() => {
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ol
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = t.kind === 'success' ? CheckCircle2 : AlertCircle;
            return (
              <motion.li
                key={t.id}
                layout
                data-kind={t.kind}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift backdrop-blur-xl',
                  'bg-surface/95',
                  t.kind === 'success' ? 'border-success/30' : 'border-danger/30',
                )}
              >
                <Icon
                  className={cn('mt-0.5 h-5 w-5 shrink-0', t.kind === 'success' ? 'text-success' : 'text-danger')}
                  aria-hidden="true"
                />
                {/* Errors interrupt screen readers; successes are announced politely. */}
                <p
                  role={t.kind === 'error' ? 'alert' : 'status'}
                  aria-live={t.kind === 'error' ? 'assertive' : 'polite'}
                  className="flex-1 text-sm text-fg"
                >
                  {t.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="-mr-1 rounded-full p-1 text-subtle transition-colors hover:bg-line/10 hover:text-fg"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </ToastContext.Provider>
  );
}
