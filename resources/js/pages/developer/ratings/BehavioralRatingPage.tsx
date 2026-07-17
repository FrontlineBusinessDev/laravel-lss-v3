import { cn } from '@/lib/utils';
import { BehavioralAssessmentForm } from '@/pages/developer/ratings/BehavioralAssessmentForm';
import { useState } from 'react';
import { BehavioralAssessmentSetup } from './BehavioralAssessmentSetup';

const SUB_TABS = ['Assessment Form', 'Question Setup'] as const;
export function BehavioralRatingPage() {
    const [tab, setTab] =
        useState<(typeof SUB_TABS)[number]>('Assessment Form');
    return (
        <div data-cy="behavioral-rating-page-div-1">
            <div
                className="no-print mb-4 flex w-fit gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1"
                data-cy="behavioral-rating-page-div-2"
            >
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
                        data-cy="behavioral-rating-page-button-set-tab"
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Assessment Form' ? (
                <BehavioralAssessmentForm data-cy="behavioral-rating-page-behavioral-assessment-form-4" />
            ) : (
                <BehavioralAssessmentSetup data-cy="behavioral-rating-page-behavioral-assessment-setup-5" />
            )}
        </div>
    );
}
