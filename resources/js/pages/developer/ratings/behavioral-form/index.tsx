import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';
import { BehavioralAssessmentForm } from '@/pages/developer/ratings/BehavioralAssessmentForm';

export default function BehavioralFormTabPage() {
    return (
        <RatingsPrimaryLayout>
            <BehavioralAssessmentForm batchLookupUrl="/batches/lookup" />
        </RatingsPrimaryLayout>
    );
}
