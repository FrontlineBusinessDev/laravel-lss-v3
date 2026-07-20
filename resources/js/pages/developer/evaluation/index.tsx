import { useBatches } from '@/context/BatchesContext';
import { seminars } from '@/data/mockData';
import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import type { EvaluationQuestion, EvaluationResponse } from '@/types';
import { useMemo } from 'react';
import {
    computeBatchAnswerStats,
    computeRatingDistribution,
    computeReminderCandidates,
    computeSeminarAnswerStats,
    overallAverage,
} from './evaluationUtils';
import { EvaluationRecordsPanel } from './EvaluationRecordsPanel';
import { StatCard } from '@/components/StatCard';
import { Bell, ClipboardList, ListChecks, Star } from 'lucide-react';
import { RatingDistributionChart } from './RatingDistributionChart';
import { BatchScoreChart } from './BatchScoreChart';
import { AnswersPerScopeTabs } from './AnswersPerScopeTabs';
import { NotificationsPanel } from './NotificationsPanel';

export default function EvaluationPage({
    questions = [],
    responses = [],
    onChangeResponses,
}: {
    questions: EvaluationQuestion[];
    responses: EvaluationResponse[];
    onChangeResponses: (next: EvaluationResponse[]) => void;
}) {
    const { trainees, batches } = useBatches();
    const batchStats = useMemo(
        () => computeBatchAnswerStats(batches, responses),
        [batches, responses],
    );
    const seminarStats = useMemo(
        () => computeSeminarAnswerStats(seminars, responses),
        [responses],
    );
    const distribution = useMemo(
        () => computeRatingDistribution(responses),
        [responses],
    );
    const reminderCandidates = useMemo(
        () => computeReminderCandidates(trainees, responses),
        [trainees, responses],
    );
    const activeQuestionCount = questions.filter(
        (q) => q.status === 'active',
    ).length;
    const activeResponseCount = responses.filter(
        (r) => r.status === 'active',
    ).length;
    const avgScore = overallAverage(responses);
    return (
        <>
            <EvaluationPrimaryLayout>
                <div
                    className="flex flex-col gap-4"
                    data-cy="overview-tab-div-1"
                >
                    {/* Records management — prioritized at the top so admins land here first */}
                    <EvaluationRecordsPanel
                        responses={responses}
                        onChange={onChangeResponses}
                        batchOptions={Array.from(
                            new Set(
                                responses
                                    .filter((r) => r.batchNo)
                                    .map((r) => r.batchNo!),
                            ),
                        ).sort()}
                        data-cy="overview-tab-evaluation-records-panel-change-responses"
                    />

                    {/* Stat cards */}
                    <div
                        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                        data-cy="overview-tab-div-3"
                    >
                        <StatCard
                            label="Active questions"
                            value={activeQuestionCount}
                            icon={ListChecks}
                            hint="Across trainer & seminar forms"
                            data-cy="overview-tab-stat-card-active-questions"
                        />
                        <StatCard
                            label="Total responses"
                            value={activeResponseCount}
                            icon={ClipboardList}
                            hint="Active evaluation records"
                            data-cy="overview-tab-stat-card-total-responses"
                        />
                        <StatCard
                            label="Average rating"
                            value={avgScore.toFixed(1)}
                            icon={Star}
                            tone="accent"
                            hint="Out of 5 stars"
                            data-cy="overview-tab-stat-card-average-rating"
                        />
                        <StatCard
                            label="Pending reminders"
                            value={reminderCandidates.length}
                            icon={Bell}
                            tone={
                                reminderCandidates.length > 0
                                    ? 'warning'
                                    : 'default'
                            }
                            hint="Hours met, evaluation not yet submitted"
                            data-cy="overview-tab-stat-card-pending-reminders"
                        />
                    </div>

                    {/* Charts */}
                    <div
                        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                        data-cy="overview-tab-div-8"
                    >
                        <RatingDistributionChart
                            data={distribution}
                            data-cy="overview-tab-rating-distribution-chart-9"
                        />
                        <BatchScoreChart
                            stats={batchStats}
                            data-cy="overview-tab-batch-score-chart-10"
                        />
                    </div>

                    {/* Answers per batch / seminar — tabbed, click through to individual answers */}
                    <AnswersPerScopeTabs
                        batchStats={batchStats}
                        seminarStats={seminarStats}
                        responses={responses}
                        data-cy="overview-tab-answers-per-scope-tabs-11"
                    />

                    {/* Notifications */}
                    <NotificationsPanel
                        candidates={reminderCandidates}
                        data-cy="overview-tab-notifications-panel-12"
                    />
                </div>
                ;
            </EvaluationPrimaryLayout>
        </>
    );
}
