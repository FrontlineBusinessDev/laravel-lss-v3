import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';
import TaskRatingPage from '@/pages/developer/ratings/TaskRatingPage';

export default function TaskRatingTabPage() {
    return (
        <RatingsPrimaryLayout>
            <TaskRatingPage batchLookupUrl="/batches/lookup" />
        </RatingsPrimaryLayout>
    );
}
