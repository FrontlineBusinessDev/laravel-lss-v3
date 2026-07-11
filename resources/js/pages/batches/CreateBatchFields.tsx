import { Building2, Video } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Presentational atoms for the batch create/edit modal (see CreateBatchModal).
 * Kept separate so the modal file stays focused on state + submission.
 */
const labelCls = 'mb-1.5 block text-sm font-medium text-neutral-700';

const SETUP_CHOICES = [
    { value: 'f2f', label: 'Face-to-face', icon: Building2 },
    { value: 'online', label: 'Online', icon: Video },
] as const;

/** "Mon D, YYYY" — the read-only Created-date display format. */
export const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

export function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
        </div>
    );
}

export function ReadonlyField({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            <div
                className={`flex h-9 items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-sm text-neutral-500 ${mono ? 'font-mono' : ''}`}
            >
                {value}
            </div>
        </div>
    );
}

export function SetupToggle({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: 'f2f' | 'online') => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {SETUP_CHOICES.map(({ value: v, label, icon: Icon }) => {
                const active = value === v;

                return (
                    <button
                        key={v}
                        type="button"
                        onClick={() => onChange(v)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border py-3 text-sm font-medium transition-colors ${
                            active
                                ? 'border-brand-500 bg-brand-50 text-brand-600 ring-1 ring-brand-500'
                                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
