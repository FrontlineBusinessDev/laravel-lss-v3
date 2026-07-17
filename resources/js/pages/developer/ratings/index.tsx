import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';
import TaskRatingPage from '@/pages/developer/ratings/TaskRatingPage';

export default function RatingsPage() {
    return (
        <RatingsPrimaryLayout data-cy="ratings-index-ratings-primary-layout-1">
            <TaskRatingPage data-cy="ratings-index-task-rating-page-6" />
        </RatingsPrimaryLayout>
    );
}
