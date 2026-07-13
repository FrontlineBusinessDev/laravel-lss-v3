import { useState } from 'react';
import { cn } from '@/lib/utils';
import TaskRatingPage from '@/pages/ratings/TaskRatingPage';
import { BehavioralRatingPage } from '@/pages/ratings/BehavioralRatingPage';
const TABS = ['Task Rating', 'Behavioral Rating'] as const;
export default function RatingsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Task Rating');
  return <div data-cy="index-div-1">
      <div className="mb-4 no-print" data-cy="index-div-2">
        <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-ratings">Ratings</h1>
      </div>

      <div className="mb-4 flex gap-5 border-b border-neutral-200 pl-0.5 no-print" data-cy="index-div-4">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('pb-2.5 text-xs font-medium transition-colors', tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700')} data-cy="index-button-set-tab">
            {t}
          </button>)}
      </div>

      {tab === 'Task Rating' ? <TaskRatingPage data-cy="index-task-rating-page-6" /> : <BehavioralRatingPage data-cy="index-behavioral-rating-page-7" />}
    </div>;
}