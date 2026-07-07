/**
 * @file resources/ts/components/modal/ConfirmInUseModal.tsx
 *
 * Shown when the user tries to archive/delete a record that is still
 * referenced by other records (e.g. a Role that has Users assigned).
 *
 * Props:
 *  open          – controls visibility
 *  title         – modal heading  (default: "Record In Use")
 *  description   – body copy explaining why it cannot proceed
 *  usages        – optional list of items currently using the record
 *                  e.g. [{ label: 'Users', count: 3 }]
 *  onClose       – called when the user dismisses the modal
 */

import { AlertTriangle, X } from 'lucide-react';
import React from 'react';
import { useScrollLock } from '@/hooks/use-scroll-lock';

export interface InUseEntry {
    /** Human-readable name of the dependent resource (e.g. "Users", "Courses"). */
    label: string;
    /** How many records reference this one. */
    count: number;
}

interface ConfirmInUseModalProps {
    open: boolean;
    title?: string;
    description?: string;
    /** Name of the record being blocked (e.g. the role name). */
    recordLabel?: string;
    /** List of dependents that block the action. */
    usages?: InUseEntry[];
    onClose: () => void;
}

/**
 * Informational modal — no destructive action, only a dismiss button.
 * Use this when an archive / delete is blocked because the record is
 * still in use by other entities.
 */
export function ConfirmInUseModal({
    open,
    title = 'Record In Use',
    description,
    recordLabel,
    usages = [],
    onClose,
}: ConfirmInUseModalProps) {
    // Lock background scroll while the dialog is open (no layout shift).
    useScrollLock(open);

    if (!open) {
return null;
}

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
onClose();
}
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                            <AlertTriangle
                                className="h-5 w-5 text-amber-600"
                                strokeWidth={1.75}
                            />
                        </span>
                        <h2 className="text-base font-semibold">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-3">
                    <p className="text-sm">
                        {description ?? (
                            <>
                                <span className="font-medium">
                                    {recordLabel ?? 'This record'}
                                </span>{' '}
                                cannot deleted because it is still assigned to
                                the following:
                            </>
                        )}
                    </p>

                    {/* Usage breakdown */}
                    {usages.length > 0 && (
                        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                            {usages.map((u) => (
                                <li
                                    key={u.label}
                                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                                >
                                    <span className="">{u.label}</span>
                                    <span className="font-semibold tabular-nums">
                                        {u.count}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs">
                        Reassign or remove all references before trying again.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50/10"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
