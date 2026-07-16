import { DevelopmentPlaceholder } from '@/components/DevelopmentPlaceholder';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';

export default function index() {
    return (
        <>
            <TraineeLayout title="Dashboard">
                <DevelopmentPlaceholder feature="Dashboard" />
            </TraineeLayout>
        </>
    );
}
