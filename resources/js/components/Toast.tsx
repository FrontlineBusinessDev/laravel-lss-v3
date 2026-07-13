import { cn } from '@/lib/utils';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
interface ToastItem {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}
interface ToastContextValue {
  showToast: (message: string, variant?: ToastItem['variant']) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
const VARIANT_STYLES: Record<ToastItem['variant'], string> = {
  success: 'border-success-100 bg-white text-ink',
  error: 'border-danger-100 bg-white text-ink',
  info: 'border-neutral-200 bg-white text-ink'
};
const VARIANT_ICON = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};
const ICON_COLOR: Record<ToastItem['variant'], string> = {
  success: 'text-success-600',
  error: 'text-danger-600',
  info: 'text-brand-500'
};
let idCounter = 0;
export function SystemToastProvider({
  children
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = ++idCounter;
    setToasts(t => [...t, {
      id,
      message,
      variant
    }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 3200);
  }, []);
  const dismiss = (id: number) => setToasts(t => t.filter(x => x.id !== id));
  return <ToastContext.Provider value={{
    showToast
  }} data-cy="toast-toast-context-provider-1">
            {children}
            {createPortal(<div className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:items-end" data-cy="toast-div-2">
                    {toasts.map(t => {
        const Icon = VARIANT_ICON[t.variant];
        return <div key={t.id} role="status" className={cn('pointer-events-auto flex w-full max-w-sm animate-scaleIn items-start gap-2.5 rounded-lg border p-3 shadow-popover', VARIANT_STYLES[t.variant])} data-cy="toast-div-3">
                                <Icon size={16} className={cn('mt-0.5 shrink-0', ICON_COLOR[t.variant])} data-cy="toast-icon-4" />
                                <p className="flex-1 text-sm leading-snug text-ink" data-cy="toast-p-5">
                                    {t.message}
                                </p>
                                <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="rounded-sm p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="toast-button-dismiss-notification">
                                    <X size={14} data-cy="toast-x-7" />
                                </button>
                            </div>;
      })}
                </div>, document.body)}
        </ToastContext.Provider>;
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}