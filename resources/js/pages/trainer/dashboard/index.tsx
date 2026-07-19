import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { AnnouncementsFeedCard } from './AnnouncementsFeedCard';
import { DocumentComplianceAlert } from './DocumentComplianceAlert';
import { OnLeaveTrackerCard } from './OnLeaveTrackerCard';
import { OngoingTasksPanel } from './OngoingTasksPanel';
import { ScheduleCalendarWidget } from './ScheduleCalendarWidget';
import { TraineeMetricCard } from './TraineeMetricCard';
import { UpcomingEndsAlert } from './UpcomingEndsAlert';

export default function index() {
    return (
        <TrainerLayout title="Dashboard">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <TraineeMetricCard />
                <UpcomingEndsAlert />
                <DocumentComplianceAlert />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ScheduleCalendarWidget />
                <OnLeaveTrackerCard />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <OngoingTasksPanel />
                <AnnouncementsFeedCard />
            </div>
        </TrainerLayout>
    );
}
