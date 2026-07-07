import type { EvaluationQuestion } from '@/types'
import { QuestionsPanel } from './QuestionsPanel'
import { AccessOverridePanel } from './AccessOverridePanel'

export function TrainersQuestionnaireTab({
  questions,
  onChange,
  currentUserName,
  sets,
  onAddSet,
}: {
  questions: EvaluationQuestion[]
  onChange: (next: EvaluationQuestion[]) => void
  currentUserName: string
  sets: string[]
  onAddSet: (name: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <QuestionsPanel category="Trainer" questions={questions} onChange={onChange} currentUserName={currentUserName} sets={sets} onAddSet={onAddSet} />
      <AccessOverridePanel />
    </div>
  )
}
