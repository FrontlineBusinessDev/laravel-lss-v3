// resources/ts/hooks/use-toast.tsx

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms, default 4000. Pass 0 to persist until dismissed.
}
interface ToastItem extends ToastOptions {
  id: number;
}
interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
export function ToastProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  const toast = useCallback((options: ToastOptions) => {
    const id = ++idRef.current;
    const duration = options.duration ?? 4000;
    setToasts(prev => [...prev, {
      id,
      ...options
    }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);
  return <ToastContext.Provider value={{
    toast,
    dismiss
  }} data-cy="use-toast-toast-context-provider-1">
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} data-cy="use-toast-toast-viewport-2" />
        </ToastContext.Provider>;
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ─── Viewport + individual toast ──────────────────────────────────────────

function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return <div className="pointer-events-none fixed top-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2" data-cy="use-toast-div-3">
            {toasts.map(t => <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} data-cy="use-toast-toast-card-4" />)}
        </div>;
}
const variantStyles: Record<ToastVariant, {
  border: string;
  icon: string;
  dot: string;
}> = {
  success: {
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  error: {
    border: 'border-rose-200',
    icon: 'text-rose-600',
    dot: 'bg-rose-500'
  },
  warning: {
    border: 'border-amber-200',
    icon: 'text-amber-600',
    dot: 'bg-amber-500'
  },
  info: {
    border: 'border-slate-200',
    icon: 'text-slate-600',
    dot: 'bg-slate-500'
  }
};
function ToastCard({
  toast,
  onDismiss
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const variant = toast.variant ?? 'info';
  const styles = variantStyles[variant];
  return <div role="status" className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${styles.border} animate-in bg-white p-4 shadow-lg ring-1 ring-black/5 duration-200 fade-in slide-in-from-top-2`} data-cy="use-toast-div-5">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} data-cy="use-toast-span-6" />
            <div className="min-w-0 flex-1" data-cy="use-toast-div-7">
                {toast.title && <p className="text-sm font-semibold text-slate-900" data-cy="use-toast-p-8">
                        {toast.title}
                    </p>}
                {toast.description && <p className="mt-0.5 text-sm text-slate-500" data-cy="use-toast-p-9">
                        {toast.description}
                    </p>}
            </div>
            <button type="button" onClick={onDismiss} className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" data-cy="use-toast-button-button">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true" data-cy="use-toast-svg-11">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>
        </div>;
}