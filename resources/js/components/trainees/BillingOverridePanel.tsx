import { traineeBillingOverrideService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { useToast } from '@/components/Toast';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Props {
    trainee: TraineeDetail;
}

type OverrideKey =
    | 'override_rate_per_hour'
    | 'override_hours_discount_percent'
    | 'override_group_discount_percent';

const OVERRIDE_FIELDS: { key: OverrideKey; label: string; suffix: string }[] = [
    {
        key: 'override_rate_per_hour',
        label: 'Rate per hour',
        suffix: '₱/hr',
    },
    {
        key: 'override_hours_discount_percent',
        label: 'Hours discount',
        suffix: '%',
    },
    {
        key: 'override_group_discount_percent',
        label: 'Group discount',
        suffix: '%',
    },
];

/**
 * Read-only computed billing figures plus per-field override toggles. A
 * non-null override_* column IS the "is overridden" signal BillingService
 * already reads — there is no separate boolean flag. The toggle's on/off
 * state is tracked locally so flipping it on reveals the input immediately,
 * ahead of the column actually being persisted as non-null.
 */
export function BillingOverridePanel({ trainee }: Props) {
    const { showToast } = useToast();
    const [saving, setSaving] = useState<OverrideKey | null>(null);
    const [enabled, setEnabled] = useState<Record<OverrideKey, boolean>>({
        override_rate_per_hour: trainee.override_rate_per_hour !== null,
        override_hours_discount_percent:
            trainee.override_hours_discount_percent !== null,
        override_group_discount_percent:
            trainee.override_group_discount_percent !== null,
    });
    const [drafts, setDrafts] = useState<Record<OverrideKey, string>>({
        override_rate_per_hour: trainee.override_rate_per_hour ?? '',
        override_hours_discount_percent:
            trainee.override_hours_discount_percent ?? '',
        override_group_discount_percent:
            trainee.override_group_discount_percent ?? '',
    });

    useEffect(() => {
        setEnabled({
            override_rate_per_hour: trainee.override_rate_per_hour !== null,
            override_hours_discount_percent:
                trainee.override_hours_discount_percent !== null,
            override_group_discount_percent:
                trainee.override_group_discount_percent !== null,
        });
        setDrafts({
            override_rate_per_hour: trainee.override_rate_per_hour ?? '',
            override_hours_discount_percent:
                trainee.override_hours_discount_percent ?? '',
            override_group_discount_percent:
                trainee.override_group_discount_percent ?? '',
        });
    }, [
        trainee.override_rate_per_hour,
        trainee.override_hours_discount_percent,
        trainee.override_group_discount_percent,
    ]);

    const persist = async (key: OverrideKey, value: string | null) => {
        setSaving(key);
        try {
            await traineeBillingOverrideService.update(trainee.id, {
                [key]: value,
            });
            showToast('Billing override updated', 'success');
            router.reload({ only: ['trainee'] });
        } catch (error) {
            showToast(
                error instanceof ApiError
                    ? error.message
                    : 'Failed to update override',
                'error',
            );
        } finally {
            setSaving(null);
        }
    };

    const toggle = (key: OverrideKey, next: boolean) => {
        setEnabled((e) => ({ ...e, [key]: next }));
        if (!next) {
            setDrafts((d) => ({ ...d, [key]: '' }));
            void persist(key, null);
            return;
        }
        const fallback =
            key === 'override_rate_per_hour'
                ? trainee.applied_rate_per_hour
                : key === 'override_hours_discount_percent'
                  ? trainee.hours_discount_percent
                  : trainee.group_discount_percent;
        setDrafts((d) => ({ ...d, [key]: fallback }));
    };

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-5"
            data-cy="billing-override-panel-div-1"
        >
            <h3 className="mb-1 text-sm font-semibold text-ink">
                Rate & discount overrides
            </h3>
            <p className="mb-4 text-xs text-neutral-500">
                Toggle on to hardcode a custom rate or discount for this trainee
                instead of the computed default.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {OVERRIDE_FIELDS.map(({ key, label, suffix }) => {
                    const isOn = enabled[key];
                    const isSaving = saving === key;
                    return (
                        <div
                            key={key}
                            data-cy="billing-override-panel-div-field"
                        >
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs font-medium text-neutral-600">
                                    {label}
                                </span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isOn}
                                    onClick={() => toggle(key, !isOn)}
                                    disabled={isSaving}
                                    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                                        isOn ? 'bg-brand-500' : 'bg-neutral-200'
                                    }`}
                                    data-cy="billing-override-panel-toggle"
                                >
                                    <span
                                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                                            isOn
                                                ? 'translate-x-4.5'
                                                : 'translate-x-0.5'
                                        }`}
                                    />
                                </button>
                            </div>
                            {isOn ? (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={drafts[key]}
                                        disabled={isSaving}
                                        onChange={(e) =>
                                            setDrafts((d) => ({
                                                ...d,
                                                [key]: e.target.value,
                                            }))
                                        }
                                        onBlur={() =>
                                            void persist(key, drafts[key])
                                        }
                                        className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2.5 text-sm text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                        data-cy="billing-override-panel-input"
                                    />
                                    <span className="text-xs text-neutral-400">
                                        {suffix}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-neutral-400">
                                    Using computed default
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
