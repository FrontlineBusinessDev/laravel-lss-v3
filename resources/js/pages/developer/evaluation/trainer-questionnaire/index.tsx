import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { EvaluationQuestion } from '@/types';
import { AccessOverridePanel } from '../AccessOverridePanel';
import { QuestionsPanel } from '../QuestionsPanel';
import { evaluationQuestions, questionSetsByCategory } from '@/data/mockData';

export default function index({
    questions = [],
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
            <div
                className="flex flex-col gap-4"
                data-cy="trainers-questionnaire-tab-div-1"
            >
                <QuestionsPanel
                    category="Trainer"
                    questions={evaluationQuestions}
                    onChange={onChange}
                    currentUserName={currentUserName}
                    sets={questionSetsByCategory.Trainer}
                    onAddSet={onAddSet}
                    data-cy="trainers-questionnaire-tab-questions-panel-change"
                />
                <AccessOverridePanel data-cy="trainers-questionnaire-tab-access-override-panel-3" />
            </div>
        </EvaluationPrimaryLayout>
    );
}
