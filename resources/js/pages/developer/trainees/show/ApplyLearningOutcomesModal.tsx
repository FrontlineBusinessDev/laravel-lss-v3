import { useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import type { FieldOption } from '@/types/reusable/fields';

type TargetType = 'batch' | 'school' | 'industry' | 'specific';

const TARGET_OPTIONS: { value: TargetType; label: string }[] = [
    { value: 'batch', label: 'All Trainees in This Batch' },
    { value: 'school', label: 'Same School' },
    { value: 'industry', label: 'Same Industry' },
    { value: 'specific', label: 'Specific Trainees' },
];

interface PersonOption {
    id: number;
    first_name: string;
    last_name: string;
}

async function loadTraineeOptions(query: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<{ data: PersonOption[] }>(
        `/trainees/pagination-search?filters[status]=active&per_page=50&search=${encodeURIComponent(query)}`,
    );
    return (res.data?.data ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name}`,
    }));
}

interface Props {
    open: boolean;
    onClose: () => void;
    onApplied?: () => void;
    traineeId: number;
    outcomeIds: number[];
}

export function ApplyLearningOutcomesModal({
    open,
    onClose,
    onApplied,
    traineeId,
    outcomeIds,
}: Props) {
    const { showToast } = useToast();
    const [targetType, setTargetType] = useState<TargetType>('batch');
    const [traineeIds, setTraineeIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    function reset() {
        setTargetType('batch');
        setTraineeIds([]);
    }

    async function handleApply() {
        setSubmitting(true);
        try {
            const res = await apiFetchJson<{ applied: number; skipped: number }>(
                `/trainees/${traineeId}/learning-outcomes/apply-to`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        outcome_ids: outcomeIds,
                        target_type: targetType,
                        ...(targetType === 'specific'
                            ? { trainee_ids: traineeIds.map(Number) }
                            : {}),
                    }),
                },
            );
            const { applied, skipped } = res.data ?? { applied: 0, skipped: 0 };
            showToast(
                `Applied to ${applied} trainee${applied === 1 ? '' : 's'}${skipped > 0 ? ` (${skipped} skipped)` : ''}.`,
                'success',
            );
            reset();
            onClose();
            onApplied?.();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Failed to apply outcomes.',
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
                if (submitting) return;
                reset();
                onClose();
            }}
            title="Apply learning outcomes to"
            description="The currently checked learning outcomes will be applied to the selected trainees."
            data-cy="apply-learning-outcomes-modal"
        >
            <div className="mb-4 flex flex-col gap-2">
                {TARGET_OPTIONS.map((opt) => (
                    <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md border border-neutral-200 p-2.5 text-sm has-checked:border-brand-200 has-checked:bg-brand-50"
                    >
                        <input
                            type="radio"
                            name="apply-target-type"
                            value={opt.value}
                            checked={targetType === opt.value}
                            onChange={() => setTargetType(opt.value)}
                            className="accent-brand-500"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {targetType === 'specific' && (
                <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                        Trainees
                    </label>
                    <AsyncMultiSelectField
                        value={traineeIds}
                        onChange={setTraineeIds}
                        loadOptions={loadTraineeOptions}
                        placeholder="Select trainee(s)"
                    />
                </div>
            )}

            <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() => void handleApply()}
                    disabled={
                        submitting ||
                        outcomeIds.length === 0 ||
                        (targetType === 'specific' && traineeIds.length === 0)
                    }
                >
                    {submitting ? 'Applying…' : 'Apply'}
                </Button>
            </div>
        </Modal>
    );
}
