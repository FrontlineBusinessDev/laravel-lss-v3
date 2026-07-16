import type { EvaluationQuestion } from '@/types';
import { QuestionsPanel } from '../QuestionsPanel';
import { AccessOverridePanel } from '../AccessOverridePanel';

const PERMISSION = 'manage users';

export function TrainersQuestionnaireTab({
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
        <div
            className="flex flex-col gap-4"
            data-cy="trainers-questionnaire-tab-div-1"
        >
            <QuestionsPanel
                category="Trainer"
                questions={questions}
                onChange={onChange}
                currentUserName={currentUserName}
                sets={sets}
                onAddSet={onAddSet}
                data-cy="trainers-questionnaire-tab-questions-panel-change"
            />
            <AccessOverridePanel data-cy="trainers-questionnaire-tab-access-override-panel-3" />
        </div>
    );
}
