import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import type { AppTraineeLearningOutcome } from '@/types/modules/trainees/trainee-detail';

/**
 * Optimistic active/inactive toggle for a trainee's learning outcomes,
 * mirroring use-batch-link-actions.ts: an instant local override keyed by
 * outcome id, reverted if the PATCH fails.
 */
export function useTraineeOutcomeToggle(
    traineeId: number,
    basePath: string = '/trainees',
) {
    const { showToast } = useToast();
    const [override, setOverride] = useState<Record<number, 'active' | 'inactive'>>({});
    const [savingId, setSavingId] = useState<number | null>(null);

    const isAchieved = (outcome: AppTraineeLearningOutcome) =>
        (override[outcome.id] ?? outcome.status) === 'active';

    const setStatus = async (outcome: AppTraineeLearningOutcome, next: 'active' | 'inactive') => {
        const previous = isAchieved(outcome) ? 'active' : 'inactive';
        if (previous === next) return;
        setOverride((m) => ({ ...m, [outcome.id]: next }));
        setSavingId(outcome.id);

        try {
            await apiFetchJson(
                `${basePath}/${traineeId}/learning-outcomes/${outcome.id}`,
                { method: 'PATCH', body: JSON.stringify({ status: next }) },
            );
        } catch (err) {
            setOverride((m) => ({ ...m, [outcome.id]: previous }));
            showToast(
                err instanceof Error ? err.message : 'Please try again.',
                'error',
            );
        } finally {
            setSavingId(null);
        }
    };

    const toggle = (outcome: AppTraineeLearningOutcome) =>
        setStatus(outcome, isAchieved(outcome) ? 'inactive' : 'active');

    const toggleAll = (
        outcomes: AppTraineeLearningOutcome[],
        status: 'active' | 'inactive',
    ) => Promise.all(outcomes.map((outcome) => setStatus(outcome, status)));

    return { isAchieved, toggle, toggleAll, savingId };
}
