import { DevelopmentPlaceholder } from '@/components/DevelopmentPlaceholder';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';

export default function index() {
    return (
        <>
            <TrainerLayout title="Dashboard">
                <DevelopmentPlaceholder feature="Dashboard" />
            </TrainerLayout>
        </>
    );
}
