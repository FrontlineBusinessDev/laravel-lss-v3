import { useState } from 'react';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import TaskRatingPage from './TaskRatingPage';
import { BehavioralAssessmentSetup } from './BehavioralAssessmentSetup';
import { BehavioralAssessmentForm } from './BehavioralAssessmentForm';

type RatingsTab = 'task' | 'form' | 'setup';

interface RatingsWorkspaceProps {
    /** Trainer pages pass their own scoped batch lookup, same convention
     * TaskRatingPage already uses. */
    batchLookupUrl?: string;
}

/**
 * Unified Ratings module — Setup (admin only) / Behavioral Form / Task
 * Rating, switched via local component state rather than separate Inertia
 * routes (replaces the old RatingsPrimaryLayout, which used <Link> nav
 * between /ratings and /ratings/behavioral-rating).
 */
export function RatingsWorkspace({ batchLookupUrl }: RatingsWorkspaceProps) {
    const { can } = usePermission();
    const showSetup = can('manage behavioral questions');
    const [tab, setTab] = useState<RatingsTab>('task');

    const tabs: { id: RatingsTab; label: string }[] = [
        { id: 'task', label: 'Task Rating' },
        { id: 'form', label: 'Behavioral Form' },
        ...(showSetup
            ? [{ id: 'setup' as const, label: 'Behavioral Setup' }]
            : []),
    ];

    return (
        <div>
            <h1 className="text-xl font-semibold text-ink">Ratings</h1>
            <p className="mb-4 text-sm text-neutral-500">
                Evaluate trainees on completed tasks and overall behavior
            </p>

            <div className="lss-scrollbar no-print mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'pb-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                            tab === t.id
                                ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'setup' && showSetup && <BehavioralAssessmentSetup />}
            {tab === 'form' && (
                <BehavioralAssessmentForm batchLookupUrl={batchLookupUrl} />
            )}
            {tab === 'task' && (
                <TaskRatingPage batchLookupUrl={batchLookupUrl} />
            )}
        </div>
    );
}
