import { useState } from 'react';
import { cn } from '@/lib/utils';
import TaskRatingPage from '@/pages/developer/ratings/TaskRatingPage';
import { BehavioralRatingPage } from '@/pages/developer/ratings/BehavioralRatingPage';

const TABS = ['Task Rating', 'Behavioral Rating'] as const;

export default function RatingsPage() {
    const [tab, setTab] = useState<(typeof TABS)[number]>('Task Rating');

    return (
        <div>
            <div className="no-print mb-4">
                <h1 className="text-xl font-semibold text-ink">Ratings</h1>
            </div>

            <div className="no-print mb-4 flex gap-5 border-b border-neutral-200 pl-0.5">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'pb-2.5 text-xs font-medium transition-colors',
                            tab === t
                                ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Task Rating' ? (
                <TaskRatingPage />
            ) : (
                <BehavioralRatingPage />
            )}
        </div>
    );
}
