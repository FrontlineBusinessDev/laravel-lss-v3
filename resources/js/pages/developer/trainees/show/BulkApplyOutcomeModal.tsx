import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import type { FieldOption } from '@/types/reusable/fields';

export type BulkApplyScope = 'all' | 'industry' | 'school' | 'trainees';

const SCOPE_OPTIONS: { value: BulkApplyScope; label: string; hint: string }[] = [
    {
        value: 'all',
        label: 'All trainees in batches',
        hint: 'Every trainee whose batch offers this outcome (same industry).',
    },
    {
        value: 'industry',
        label: 'Same industry',
        hint: 'Trainees in any batch under this outcome’s industry.',
    },
    {
        value: 'school',
        label: 'Same school',
        hint: 'Trainees from this trainee’s partner school only.',
    },
    {
        value: 'trainees',
        label: 'Specific trainees',
        hint: 'Choose one or more trainees individually.',
    },
];

interface BulkApplyOutcomeModalProps {
    open: boolean;
    traineeId: number;
    outcome: { id: number; title: string } | null;
    status: 'active' | 'inactive';
    onClose: () => void;
    onApplied: (affected: number) => void;
}

async function loadTraineeOptions(q: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<
        { id: number; first_name: string; last_name: string }[]
    >(`/trainees/lookup?status=active&per_page=50&q=${encodeURIComponent(q)}`);
    return (res.data ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name}`.trim(),
    }));
}

/**
 * Lets staff widen a single outcome toggle beyond the trainee being edited —
 * triggered from LearningOutcomesTab when "Apply to all batches" is checked.
 * Every scope still only reaches trainees in the outcome's own industry
 * (enforced server-side in TraineesController::bulkUpdateLearningOutcomeStatus).
 */
export function BulkApplyOutcomeModal({
    open,
    traineeId,
    outcome,
    status,
    onClose,
    onApplied,
}: BulkApplyOutcomeModalProps) {
    const { showToast } = useToast();
    const [scope, setScope] = useState<BulkApplyScope>('all');
    const [traineeIds, setTraineeIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    function reset() {
        setScope('all');
        setTraineeIds([]);
    }

    async function submit() {
        if (!outcome) return;
        if (scope === 'trainees' && traineeIds.length === 0) {
            showToast('Select at least one trainee.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetchJson<{ affected: number }>(
                `/trainees/${traineeId}/learning-outcomes/${outcome.id}/bulk`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status,
                        scope,
                        trainee_ids:
                            scope === 'trainees'
                                ? traineeIds.map(Number)
                                : undefined,
                    }),
                },
            );
            showToast(
                `Applied to ${res.data?.affected ?? 0} trainee(s).`,
                'success',
            );
            reset();
            onApplied(res.data?.affected ?? 0);
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Failed to apply.',
                'error',
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset();
                onClose();
            }}
            title="Apply to other trainees"
            description={
                outcome
                    ? `Mark "${outcome.title}" as ${status === 'active' ? 'achieved' : 'not achieved'} for more than just this trainee.`
                    : undefined
            }
            maxWidth={440}
            data-cy="bulk-apply-outcome-modal-modal"
        >
            <div className="flex flex-col gap-2" data-cy="bulk-apply-outcome-modal-div-scope">
                {SCOPE_OPTIONS.map((opt) => (
                    <label
                        key={opt.value}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50"
                        data-cy="bulk-apply-outcome-modal-label-scope"
                    >
                        <input
                            type="radio"
                            name="bulk-apply-scope"
                            checked={scope === opt.value}
                            onChange={() => setScope(opt.value)}
                            className="mt-0.5 h-4 w-4 accent-brand-500"
                            data-cy="bulk-apply-outcome-modal-input-radio"
                        />
                        <span data-cy="bulk-apply-outcome-modal-span-option">
                            <span className="block text-sm font-medium text-ink">
                                {opt.label}
                            </span>
                            <span className="block text-xs text-neutral-500">
                                {opt.hint}
                            </span>
                        </span>
                    </label>
                ))}

                {scope === 'trainees' && (
                    <div className="mt-1" data-cy="bulk-apply-outcome-modal-div-trainee-select">
                        <AsyncMultiSelectField
                            value={traineeIds}
                            onChange={setTraineeIds}
                            loadOptions={loadTraineeOptions}
                            placeholder="Select trainees..."
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 flex gap-2" data-cy="bulk-apply-outcome-modal-div-actions">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                        reset();
                        onClose();
                    }}
                    data-cy="bulk-apply-outcome-modal-button-cancel"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={submit}
                    disabled={submitting}
                    data-cy="bulk-apply-outcome-modal-button-apply"
                >
                    Apply
                </Button>
            </div>
        </Modal>
    );
}
