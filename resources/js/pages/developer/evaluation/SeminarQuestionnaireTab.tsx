import type { EvaluationQuestion } from '@/types';
import { QuestionsPanel } from './QuestionsPanel';
export function SeminarQuestionnaireTab({
  questions,
  onChange,
  currentUserName,
  sets,
  onAddSet
}: {
  questions: EvaluationQuestion[];
  onChange: (next: EvaluationQuestion[]) => void;
  currentUserName: string;
  sets: string[];
  onAddSet: (name: string) => void;
}) {
  return <QuestionsPanel category="Seminar" questions={questions} onChange={onChange} currentUserName={currentUserName} sets={sets} onAddSet={onAddSet} data-cy="seminar-questionnaire-tab-questions-panel-change" />;
}