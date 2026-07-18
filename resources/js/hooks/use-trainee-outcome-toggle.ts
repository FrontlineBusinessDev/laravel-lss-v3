import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
    const { toast } = useToast();
    const [override, setOverride] = useState<Record<number, 'active' | 'inactive'>>({});
    const [savingId, setSavingId] = useState<number | null>(null);

    const isAchieved = (outcome: AppTraineeLearningOutcome) =>
        (override[outcome.id] ?? outcome.status) === 'active';

    const toggle = async (outcome: AppTraineeLearningOutcome) => {
        const next = isAchieved(outcome) ? 'inactive' : 'active';
        setOverride((m) => ({ ...m, [outcome.id]: next }));
        setSavingId(outcome.id);

        try {
            await apiFetchJson(
                `${basePath}/${traineeId}/learning-outcomes/${outcome.id}`,
                { method: 'PATCH', body: JSON.stringify({ status: next }) },
            );
        } catch (err) {
            setOverride((m) => ({
                ...m,
                [outcome.id]: next === 'active' ? 'inactive' : 'active',
            }));
            toast({
                title: 'Update failed',
                description:
                    err instanceof Error ? err.message : 'Please try again.',
                variant: 'error',
            });
        } finally {
            setSavingId(null);
        }
    };

    return { isAchieved, toggle, savingId };
}
