import { useMemo } from 'react'
import { ClipboardList, Star, Bell, ListChecks } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { useBatches } from '@/context/BatchesContext'
import { seminars } from '@/data/mockData'
import type { EvaluationQuestion, EvaluationResponse } from '@/types'
import { RatingDistributionChart } from './RatingDistributionChart'
import { BatchScoreChart } from './BatchScoreChart'
import { AnswersPerScopeTabs } from './AnswersPerScopeTabs'
import { NotificationsPanel } from './NotificationsPanel'
import { EvaluationRecordsPanel } from './EvaluationRecordsPanel'
import {
  computeBatchAnswerStats,
  computeSeminarAnswerStats,
  computeRatingDistribution,
  computeReminderCandidates,
  overallAverage,
} from './evaluationUtils'

export function OverviewTab({
  questions,
  responses,
  onChangeResponses,
}: {
  questions: EvaluationQuestion[]
  responses: EvaluationResponse[]
  onChangeResponses: (next: EvaluationResponse[]) => void
}) {
  const { trainees, batches } = useBatches()

  const batchStats = useMemo(() => computeBatchAnswerStats(batches, responses), [batches, responses])
  const seminarStats = useMemo(() => computeSeminarAnswerStats(seminars, responses), [responses])
  const distribution = useMemo(() => computeRatingDistribution(responses), [responses])
  const reminderCandidates = useMemo(() => computeReminderCandidates(trainees, responses), [trainees, responses])
  const activeQuestionCount = questions.filter((q) => q.status === 'active').length
  const activeResponseCount = responses.filter((r) => r.status === 'active').length
  const avgScore = overallAverage(responses)

  return (
    <div className="flex flex-col gap-4">
      {/* Records management — prioritized at the top so admins land here first */}
      <EvaluationRecordsPanel
        responses={responses}
        onChange={onChangeResponses}
        batchOptions={Array.from(new Set(responses.filter((r) => r.batchNo).map((r) => r.batchNo!))).sort()}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active questions" value={activeQuestionCount} icon={ListChecks} hint="Across trainer & seminar forms" />
        <StatCard label="Total responses" value={activeResponseCount} icon={ClipboardList} hint="Active evaluation records" />
        <StatCard label="Average rating" value={avgScore.toFixed(1)} icon={Star} tone="accent" hint="Out of 5 stars" />
        <StatCard
          label="Pending reminders"
          value={reminderCandidates.length}
          icon={Bell}
          tone={reminderCandidates.length > 0 ? 'warning' : 'default'}
          hint="Hours met, evaluation not yet submitted"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RatingDistributionChart data={distribution} />
        <BatchScoreChart stats={batchStats} />
      </div>

      {/* Answers per batch / seminar — tabbed, click through to individual answers */}
      <AnswersPerScopeTabs batchStats={batchStats} seminarStats={seminarStats} responses={responses} />

      {/* Notifications */}
      <NotificationsPanel candidates={reminderCandidates} />
    </div>
  )
}
