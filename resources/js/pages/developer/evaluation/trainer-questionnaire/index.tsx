import { evaluationQuestions } from '@/data/mockData';
import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { EvaluationQuestion } from '@/types';
import { AccessOverridePanel } from '../AccessOverridePanel';
import { QuestionsPanel } from '../QuestionsPanel';

export default function index({
    questions = [],
    onChange,
    currentUserName,
    onAddSet,
    sets,
}: {
    questions: EvaluationQuestion[];
    onChange: (next: EvaluationQuestion[]) => void;
    currentUserName: string;
    onAddSet: (name: string) => void;
    sets: string[];
}) {
    let uniqueArray = Array.from(
        new Set(
            Object.values(sets)
                .filter((i: any) => i.name !== '')
                .map((i: any) => i.name),
        ),
    );

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
                    sets={uniqueArray}
                    onAddSet={onAddSet}
                    data-cy="trainers-questionnaire-tab-questions-panel-change"
                />
                <AccessOverridePanel data-cy="trainers-questionnaire-tab-access-override-panel-3" />
            </div>
        </EvaluationPrimaryLayout>
    );
}
