/**
 * @file components/ConfirmDeleteModal.tsx
 * Confirmation dialog shown before permanently deleting a record.
 *
 * Shows a special warning when the user is about to delete their own account,
 * since that triggers an automatic logout.
 */

import { Loader2 } from 'lucide-react';
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
}: ConfirmDeleteModalProps) {
    // Lock background scroll while the dialog is open (no layout shift).
    useScrollLock(open);
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
                        disabled={busy}
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
