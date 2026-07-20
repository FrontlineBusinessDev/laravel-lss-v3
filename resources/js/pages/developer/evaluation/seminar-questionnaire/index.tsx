import { evaluationQuestions, questionSetsByCategory } from '@/data/mockData';
import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { EvaluationQuestion } from '@/types';
import { QuestionsPanel } from '../QuestionsPanel';

export default function index({
    questions,
    onChange,
    currentUserName,
    sets,
    onAddSet,
}: {
    questions: EvaluationQuestion[];
    onChange: (next: EvaluationQuestion[]) => void;
    currentUserName: string;
    sets: string[];
    onAddSet: (name: string) => void;
}) {
    return (
        <EvaluationPrimaryLayout>
            <QuestionsPanel
                category="Seminar"
                questions={evaluationQuestions}
                onChange={onChange}
                currentUserName={currentUserName}
                sets={questionSetsByCategory.Seminar}
                onAddSet={onAddSet}
                data-cy="seminar-questionnaire-tab-questions-panel-change"
            />
        </EvaluationPrimaryLayout>
    );
}
