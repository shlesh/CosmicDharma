import React, { createContext, useContext, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  visible: boolean;
}

const ToastContext = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, visible: true }]);
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
            role="alert"
            aria-live="assertive"
            className={`bg-red-600 text-white px-3 py-2 rounded shadow transition-all duration-500 transform ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
