import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BehavioralAssessmentForm } from '@/pages/developer/ratings/BehavioralAssessmentForm';
import { BehavioralAssessmentSetup } from '@/pages/developer/ratings/BehavioralAssessmentSetup';

const SUB_TABS = ['Assessment Form', 'Question Setup'] as const;

export function BehavioralRatingPage() {
    const [tab, setTab] =
        useState<(typeof SUB_TABS)[number]>('Assessment Form');

    return (
        <div>
            <div className="no-print mb-4 flex w-fit gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1">
                {SUB_TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                            tab === t
                                ? 'bg-white text-ink shadow-card'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Assessment Form' ? (
                <BehavioralAssessmentForm />
            ) : (
                <BehavioralAssessmentSetup />
            )}
        </div>
    );
}
