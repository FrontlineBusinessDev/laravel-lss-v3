import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';
import { BehavioralAssessmentSetup } from '@/pages/developer/ratings/BehavioralAssessmentSetup';

export default function BehavioralSetupTabPage() {
    return (
        <RatingsPrimaryLayout>
            <BehavioralAssessmentSetup />
        </RatingsPrimaryLayout>
    );
}
