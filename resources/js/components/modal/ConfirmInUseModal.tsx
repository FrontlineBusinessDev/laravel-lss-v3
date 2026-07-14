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
  onClose
}: ConfirmInUseModalProps) {
  // Lock background scroll while the dialog is open (no layout shift).
  useScrollLock(open);
  if (!open) {
    return null;
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }} data-cy="confirm-in-use-modal-div-1">
            <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-neutral-50 p-6 shadow-xl" data-cy="confirm-in-use-modal-div-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-3" data-cy="confirm-in-use-modal-div-3">
                    <div className="flex items-center gap-3" data-cy="confirm-in-use-modal-div-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100" data-cy="confirm-in-use-modal-span-5">
                            <AlertTriangle className="h-5 w-5 text-amber-600" strokeWidth={1.75} data-cy="confirm-in-use-modal-alert-triangle-6" />
                        </span>
                        <h2 className="text-base font-semibold" data-cy="confirm-in-use-modal-h2-7">{title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-slate-100" aria-label="Close" data-cy="confirm-in-use-modal-button-close">
                        <X className="h-4 w-4" data-cy="confirm-in-use-modal-x-9" />
                    </button>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-3" data-cy="confirm-in-use-modal-div-10">
                    <p className="text-sm" data-cy="confirm-in-use-modal-p-11">
                        {description ?? <>
                                <span className="font-medium" data-cy="confirm-in-use-modal-span-12">
                                    {recordLabel ?? 'This record'}
                                </span>{' '}
                                cannot deleted because it is still assigned to
                                the following:
                            </>}
                    </p>

                    {/* Usage breakdown */}
                    {usages.length > 0 && <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200" data-cy="confirm-in-use-modal-ul-13">
                            {usages.map(u => <li key={u.label} className="flex items-center justify-between px-4 py-2.5 text-sm" data-cy="confirm-in-use-modal-li-14">
                                    <span className="" data-cy="confirm-in-use-modal-span-15">{u.label}</span>
                                    <span className="font-semibold tabular-nums" data-cy="confirm-in-use-modal-span-16">
                                        {u.count}
                                    </span>
                                </li>)}
                        </ul>}

                    <p className="text-xs" data-cy="confirm-in-use-modal-p-reassign-or-remove-all-references-before">
                        Reassign or remove all references before trying again.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end" data-cy="confirm-in-use-modal-div-18">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50/10" data-cy="confirm-in-use-modal-button-button">
                        Got it
                    </button>
                </div>
            </div>
        </div>;
}