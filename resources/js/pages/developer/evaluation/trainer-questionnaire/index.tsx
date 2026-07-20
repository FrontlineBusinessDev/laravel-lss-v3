import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { AccessOverridePanel } from '../AccessOverridePanel';
import { EvaluationQuestionnaireSetup } from '../EvaluationQuestionnaireSetup';

export default function TrainerQuestionnairePage() {
    return (
        <EvaluationPrimaryLayout>
            <div
                className="flex flex-col gap-4"
                data-cy="trainer-questionnaire-tab-div-1"
            >
                <EvaluationQuestionnaireSetup category="Trainer" />
                <AccessOverridePanel />
            </div>
        </EvaluationPrimaryLayout>
    );
}
