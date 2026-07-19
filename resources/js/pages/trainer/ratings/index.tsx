import { useState } from 'react';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { cn } from '@/lib/utils';
import { BehavioralAssessmentForm } from '@/pages/developer/ratings/BehavioralAssessmentForm';
import TaskRatingPage from '@/pages/developer/ratings/TaskRatingPage';

type RatingsTab = 'task' | 'form';

/**
 * Trainer's own two-tab Ratings switcher. Trainer never holds
 * `manage behavioral questions` (see RoleSeeder.php), so there's no Setup
 * tab here, unlike the admin/developer Ratings pages. TaskRatingPage and
 * BehavioralAssessmentForm remain shared components — every /ratings/*
 * call they make is already batch-scoped server-side via
 * assertBatchAccessible()/ScopesToAssignedBatches regardless of caller.
 */
export default function TrainerRatingsPage() {
    const [tab, setTab] = useState<RatingsTab>('task');
    const tabs: { id: RatingsTab; label: string }[] = [
        { id: 'task', label: 'Task Rating' },
        { id: 'form', label: 'Behavioral Form' },
    ];

    return (
        <TrainerLayout title="Ratings">
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
            {tab === 'form' && (
                <BehavioralAssessmentForm batchLookupUrl="/trainer/batches/lookup" />
            )}
            {tab === 'task' && (
                <TaskRatingPage batchLookupUrl="/trainer/batches/lookup" />
            )}
        </TrainerLayout>
    );
}
