import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { EvaluationQuestionnaireSetup } from '../EvaluationQuestionnaireSetup';

export default function SeminarQuestionnairePage() {
    return (
        <EvaluationPrimaryLayout>
            <EvaluationQuestionnaireSetup category="Seminar" />
        </EvaluationPrimaryLayout>
    );
}
