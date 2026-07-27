/**
 * @file components/modal/ConfirmDeleteLogsModal.tsx
 * Password-gated confirmation for permanently deleting system logs in a date
 * range. Modeled on ConfirmDeleteModal's busy/disabled pattern, plus a
 * password field since this re-authenticates the developer before deleting.
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useScrollLock } from '@/hooks/use-scroll-lock';

interface ConfirmDeleteLogsModalProps {
    open: boolean;
    busy?: boolean;
    dateFrom: string;
    dateTo: string;
    error?: string | null;
    onCancel: () => void;
    onConfirm: (password: string) => void;
}

export function ConfirmDeleteLogsModal({
    open,
    busy,
    dateFrom,
    dateTo,
    error,
    onCancel,
    onConfirm,
}: ConfirmDeleteLogsModalProps) {
    useScrollLock(open);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (open) {
            setPassword('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
            data-cy="confirm-delete-logs-modal-div-1"
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-2xl bg-neutral-50 p-6 shadow-xl"
                data-cy="confirm-delete-logs-modal-div-2"
            >
                <h2 className="text-lg font-semibold" data-cy="confirm-delete-logs-modal-h2-title">
                    Delete logs in range?
                </h2>
                <p className="mt-1.5 text-sm text-slate-500" data-cy="confirm-delete-logs-modal-p-range">
                    This permanently deletes every log entry from{' '}
                    <span className="font-medium text-slate-700">{dateFrom}</span> to{' '}
                    <span className="font-medium text-slate-700">{dateTo}</span>. This action cannot be undone.
                </p>

                <div className="mt-4" data-cy="confirm-delete-logs-modal-div-password">
                    <label
                        htmlFor="confirm-delete-logs-password"
                        className="mb-1.5 block text-xs text-slate-500"
                    >
                        Confirm your password to continue.
                    </label>
                    <input
                        id="confirm-delete-logs-password"
                        type="password"
                        autoComplete="current-password"
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={busy}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        data-cy="confirm-delete-logs-modal-input-password"
                    />
                    {error && (
                        <p className="mt-1.5 text-xs text-danger-600" data-cy="confirm-delete-logs-modal-p-error">
                            {error}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2" data-cy="confirm-delete-logs-modal-div-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                        data-cy="confirm-delete-logs-modal-button-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(password)}
                        disabled={busy || password.length === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                        data-cy="confirm-delete-logs-modal-button-confirm"
                    >
                        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" data-cy="confirm-delete-logs-modal-loader2" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
