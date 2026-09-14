import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    MinusCircle,
    WifiOff,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { TrackedOp } from './AsyncOperations';

const STATUS_STYLES: Record<TrackedOp['status'], string> = {
    running: 'border-neutral-200 bg-white text-ink',
    offline: 'border-warning-200 bg-white text-ink',
    completed: 'border-success-100 bg-white text-ink',
    failed: 'border-danger-100 bg-white text-ink',
    cancelled: 'border-neutral-200 bg-white text-ink',
};

/**
 * Reusable progress-toast card for one tracked async operation (see
 * `useAsyncOperations()` in `AsyncOperations.tsx`) — a toast with a
 * determinate/indeterminate progress bar instead of just a message, plus
 * Cancel/Retry actions. Rendered by `AsyncOperationsProvider`; visually
 * mirrors `Toast.tsx`'s card shell so both look like the same system.
 */
export function ProgressToast({
    op,
    onCancel,
    onRetry,
    onDismiss,
}: {
    op: TrackedOp;
    onCancel: () => void;
    onRetry: () => void;
    onDismiss: () => void;
}) {
    const [minimized, setMinimized] = useState(false);
    const pct =
        op.total > 0
            ? Math.min(100, Math.round((op.processed / op.total) * 100))
            : null;

    if (minimized) {
        return (
            <button
                type="button"
                onClick={() => setMinimized(false)}
                aria-label={`Expand: ${op.label}`}
                className={cn(
                    'pointer-events-auto flex w-56 animate-scaleIn items-center gap-2 rounded-lg border p-2 text-left shadow-popover',
                    STATUS_STYLES[op.status],
                )}
            >
                <StatusIcon status={op.status} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">
                    {op.label}
                </span>
                {pct !== null &&
                    (op.status === 'running' || op.status === 'offline') && (
                        <span className="shrink-0 text-[11px] text-neutral-500">
                            {pct}%
                        </span>
                    )}
                <ChevronUp size={14} className="shrink-0 text-neutral-400" />
            </button>
        );
    }

    return (
        <div
            role="status"
            className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-scaleIn flex-col gap-2 rounded-lg border p-3 shadow-popover',
                STATUS_STYLES[op.status],
            )}
        >
            <div className="flex items-start gap-2.5">
                <StatusIcon status={op.status} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-medium text-ink">
                        {op.label}
                    </p>
                    {op.status === 'offline' && (
                        <p className="text-warning-700 mt-0.5 text-xs">
                            Connection lost — progress is safe, resume when
                            you're back online.
                        </p>
                    )}
                    {op.status === 'failed' && op.error && (
                        <p className="text-danger-700 mt-0.5 text-xs">
                            {op.error}
                        </p>
                    )}
                    {op.status === 'cancelled' && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                            Cancelled.
                        </p>
                    )}
                    {op.status === 'completed' && (
                        <p className="text-success-700 mt-0.5 text-xs">Done.</p>
                    )}
                </div>
                <button
                    onClick={() => setMinimized(true)}
                    aria-label="Minimize"
                    className="rounded-sm p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                >
                    <ChevronDown size={14} />
                </button>
                <button
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="rounded-sm p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                >
                    <X size={14} />
                </button>
            </div>

            {(op.status === 'running' || op.status === 'offline') && (
                <div className="flex flex-col gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                        <div
                            className={cn(
                                'h-full rounded-full bg-brand-600 transition-all',
                                pct === null && 'w-1/3 animate-pulse',
                            )}
                            style={
                                pct !== null ? { width: `${pct}%` } : undefined
                            }
                        />
                    </div>
                    {pct !== null && (
                        <span className="text-right text-[11px] text-neutral-500">
                            {op.processed} / {op.total}
                        </span>
                    )}
                </div>
            )}

            {(op.status === 'running' || op.status === 'offline') && (
                <div className="flex justify-end gap-3 text-xs font-medium">
                    {op.status === 'offline' && (
                        <button
                            onClick={onRetry}
                            className="text-brand-600 hover:underline"
                        >
                            Retry
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="text-neutral-500 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

function StatusIcon({ status }: { status: TrackedOp['status'] }) {
    switch (status) {
        case 'completed':
            return (
                <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-success-600"
                />
            );
        case 'failed':
            return (
                <XCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-danger-600"
                />
            );
        case 'cancelled':
            return (
                <MinusCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-neutral-400"
                />
            );
        case 'offline':
            return (
                <WifiOff
                    size={16}
                    className="mt-0.5 shrink-0 text-warning-600"
                />
            );
        default:
            return (
                <div className="mt-1 size-2.5 shrink-0 animate-pulse rounded-full bg-brand-500" />
            );
    }
}
