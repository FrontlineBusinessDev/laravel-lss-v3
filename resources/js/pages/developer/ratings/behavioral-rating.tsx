import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';
import { BehavioralRatingPage } from '@/pages/developer/ratings/BehavioralRatingPage';
export default function BehavioralRatingRoute() {
    return (
        <RatingsPrimaryLayout data-cy="behavioral-rating-ratings-primary-layout-1">
            <BehavioralRatingPage data-cy="behavioral-rating-behavioral-rating-page-7" />
        </RatingsPrimaryLayout>
    );
}
