import TaskRatingPage from '@/pages/developer/ratings/TaskRatingPage';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';

/**
 * Task Rating only (Behavioral Rating stays admin-only, Phase 2). Reuses the
 * exact same batch->task->trainee->rating workflow as the admin page — every
 * /ratings/task-rating/* call is already batch-scoped server-side
 * (TaskRatingController::assertBatchAccessible()); the only trainer-specific
 * wiring needed is pointing the batch picker at the trainer's own scoped
 * lookup so it never lists a batch they'd get a 403 selecting.
 */
export default function TrainerRatingsPage() {
    return (
        <TrainerLayout title="Ratings">
            <TaskRatingPage batchLookupUrl="/trainer/batches/lookup" />
        </TrainerLayout>
    );
}
