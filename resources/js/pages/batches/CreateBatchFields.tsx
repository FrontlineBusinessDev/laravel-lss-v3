import { Building2, Video } from 'lucide-react';

/**
 * Presentational atoms for the batch create/edit modal (see CreateBatchModal).
 * The generic field/input/label atoms now live in the shared form module so the
 * batch modal and the DataTableField record modal render identically; only the
 * batch-specific SetupToggle stays here. Re-exported for existing call sites.
 */
export {
    Field,
    formatDate,
    inputCls,
    labelCls,
    ReadonlyField,
    textareaCls,
} from '@/components/form/Field';

const SETUP_CHOICES = [
    { value: 'f2f', label: 'Face-to-face', icon: Building2 },
    { value: 'online', label: 'Online', icon: Video },
] as const;

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
