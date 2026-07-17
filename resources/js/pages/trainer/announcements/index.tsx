import { DevelopmentPlaceholder } from '@/components/DevelopmentPlaceholder';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';

export default function index() {
    return (
        <>
            <TraineeLayout title="Announcements">
                <DevelopmentPlaceholder feature="Announcements" />
            </TraineeLayout>
        </>
    );
}
