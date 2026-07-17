import type { Batch, EvaluationResponse, Seminar, Trainee } from '@/types'

export interface BatchAnswerStat {
  batch: Batch
  totalAnswers: number
  expected: number
  averageScore: number
}

/** Total number of answers per batch (Trainer-category responses), vs. expected = trainee headcount. */
export function computeBatchAnswerStats(batches: Batch[], responses: EvaluationResponse[]): BatchAnswerStat[] {
  return batches.map((batch) => {
    const batchResponses = responses.filter((r) => r.category === 'Trainer' && r.batchNo === batch.batchNo && r.status === 'active')
    const totalAnswers = batchResponses.length
    const averageScore = totalAnswers ? batchResponses.reduce((sum, r) => sum + r.averageScore, 0) / totalAnswers : 0
    return { batch, totalAnswers, expected: batch.trainees, averageScore }
  })
}

export interface SeminarAnswerStat {
  seminar: Seminar
  totalAnswers: number
  expected: number
  averageScore: number
}

export function computeSeminarAnswerStats(seminars: Seminar[], responses: EvaluationResponse[]): SeminarAnswerStat[] {
  return seminars.map((seminar) => {
    const seminarResponses = responses.filter((r) => r.category === 'Seminar' && r.seminarTopic === seminar.topic && r.status === 'active')
    const totalAnswers = seminarResponses.length
    const averageScore = totalAnswers ? seminarResponses.reduce((sum, r) => sum + r.averageScore, 0) / totalAnswers : 0
    return { seminar, totalAnswers, expected: seminar.registeredCount, averageScore }
  })
}

/** Buckets active responses into whole-star ratings 1–5 for a distribution chart. */
export function computeRatingDistribution(responses: EvaluationResponse[]): { score: number; count: number }[] {
  const buckets = [1, 2, 3, 4, 5].map((score) => ({ score, count: 0 }))
  for (const r of responses) {
    if (r.status !== 'active') continue
    const bucket = Math.min(5, Math.max(1, Math.round(r.averageScore)))
    buckets[bucket - 1].count++
  }
  return buckets
}

/** Trainees whose rendered hours have met/exceeded required hours and have not yet submitted a trainer evaluation. */
export function computeReminderCandidates(trainees: Trainee[], responses: EvaluationResponse[]): Trainee[] {
  const submittedIds = new Set(
    responses.filter((r) => r.category === 'Trainer' && r.status === 'active').map((r) => r.respondentId),
  )
  return trainees.filter((t) => !t.archived && t.completedHrs >= t.requiredHrs && !submittedIds.has(t.id))
}

export function overallAverage(responses: EvaluationResponse[]): number {
  const active = responses.filter((r) => r.status === 'active')
  if (!active.length) return 0
  return active.reduce((sum, r) => sum + r.averageScore, 0) / active.length
}
