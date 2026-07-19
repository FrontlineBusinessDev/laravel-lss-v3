/**
 * @file components/ConfirmDeleteModal.tsx
 * Confirmation dialog shown before permanently deleting a record.
 *
 * Shows a special warning when the user is about to delete their own account,
 * since that triggers an automatic logout.
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useScrollLock } from '@/hooks/use-scroll-lock';
interface ConfirmDeleteModalProps {
    open: boolean;
    busy?: boolean;
    /** Display name of the record being deleted, shown in the heading. */
    label?: string;
    onCancel: () => void;
    onConfirm: () => void;
    /** When true, shows the self-delete warning instead of the generic message. */
    isSelfDelete?: boolean;
    /**
     * GitHub-style guard: when set, the Delete button stays disabled until the
     * user types this exact value into the confirmation input.
     */
    confirmText?: string;
}

/**
 * Renders nothing when `open` is false so it can always be included
 * in the parent render tree without conditional logic at the call site.
 */
export function ConfirmDeleteModal({
    open,
    busy,
    label,
    onCancel,
    onConfirm,
    isSelfDelete,
    confirmText,
}: ConfirmDeleteModalProps) {
    // Lock background scroll while the dialog is open (no layout shift).
    useScrollLock(open);
    const [typedValue, setTypedValue] = useState('');

    useEffect(() => {
        if (open) {
            setTypedValue('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const requiresTypeToConfirm = Boolean(confirmText);
    const isUnlocked = !requiresTypeToConfirm || typedValue === confirmText;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
            data-cy="confirm-delete-modal-div-1"
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-2xl bg-neutral-50 p-6 shadow-xl"
                data-cy="confirm-delete-modal-div-2"
            >
                {isSelfDelete ? (
                    <h2
                        className="text-lg font-semibold"
                        data-cy="confirm-delete-modal-h2-are-you-sure-you-want-to"
                    >
                        Are you sure you want to delete your own account?
                        <span
                            className="mt-1 block text-sm font-normal text-primary"
                            data-cy="confirm-delete-modal-span-you-will-be-automatically-logged-out"
                        >
                            You will be automatically logged out.
                        </span>
                    </h2>
                ) : (
                    <h2
                        className="text-lg font-semibold"
                        data-cy="confirm-delete-modal-h2-delete"
                    >
                        Delete {label ?? 'this record'}?
                    </h2>
                )}

                <p
                    className="mt-1.5 text-sm text-slate-500"
                    data-cy="confirm-delete-modal-p-this-action-cannot-be-undone-the"
                >
                    This action cannot be undone. The record will be permanently
                    removed.
                </p>

                {requiresTypeToConfirm && (
                    <div className="mt-4" data-cy="confirm-delete-modal-type-to-confirm">
                        <label
                            htmlFor="confirm-delete-typed-value"
                            className="mb-1.5 block text-xs text-slate-500"
                        >
                            Type{' '}
                            <span className="font-semibold text-slate-700">
                                {confirmText}
                            </span>{' '}
                            to confirm.
                        </label>
                        <input
                            id="confirm-delete-typed-value"
                            type="text"
                            autoComplete="off"
                            autoFocus
                            value={typedValue}
                            onChange={(e) => setTypedValue(e.target.value)}
                            disabled={busy}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                            data-cy="confirm-delete-modal-input-confirm-text"
                        />
                    </div>
                )}

                <div
                    className="mt-6 flex items-center justify-end gap-2"
                    data-cy="confirm-delete-modal-div-7"
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                        data-cy="confirm-delete-modal-button-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy || !isUnlocked}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                        data-cy="confirm-delete-modal-button-button-2"
                    >
                        {busy && (
                            <Loader2
                                className="h-3.5 w-3.5 animate-spin"
                                data-cy="confirm-delete-modal-loader2-10"
                            />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
