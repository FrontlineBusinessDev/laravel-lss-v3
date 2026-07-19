import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import type { TraineeDashboardProps } from '@/types/modules/dashboard/trainee-dashboard';
import { AnnouncementsCard } from './AnnouncementsCard';
import { EligibilityCard } from './EligibilityCard';
import { InfoSummaryCard } from './InfoSummaryCard';
import { OnLeaveCard } from './OnLeaveCard';
import { OngoingTasksCard } from './OngoingTasksCard';
import { WelcomeHeader } from './WelcomeHeader';

export default function TraineeDashboardPage({
    trainee,
    summary,
    ongoingTasks,
    announcements,
    onLeave,
    eligibility,
}: TraineeDashboardProps) {
    return (
        <TraineeLayout title="Dashboard">
            <WelcomeHeader trainee={trainee} />

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <InfoSummaryCard summary={summary} />
                <EligibilityCard eligibility={eligibility} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <OngoingTasksCard tasks={ongoingTasks} />
                <AnnouncementsCard announcements={announcements} />
                <OnLeaveCard onLeave={onLeave} />
            </div>
        </TraineeLayout>
    );
}
