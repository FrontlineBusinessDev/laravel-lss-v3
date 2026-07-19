import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { RatingsWorkspace } from '@/pages/developer/ratings/RatingsWorkspace';

/**
 * Reuses the exact same Setup/Form/Task-Rating tabbed workspace as the admin
 * page (RatingsWorkspace self-hides the Setup tab via usePermission(), and
 * every /ratings/* call is already batch-scoped server-side for trainers).
 * The only trainer-specific wiring is pointing the batch picker at the
 * trainer's own scoped lookup so it never lists a batch they'd get a 403
 * selecting.
 */
export default function TrainerRatingsPage() {
    return (
        <TrainerLayout title="Ratings">
            <RatingsWorkspace batchLookupUrl="/trainer/batches/lookup" />
        </TrainerLayout>
    );
}
