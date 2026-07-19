import { MetricsRow } from './MetricsRow';
import { EarningsWidget } from './EarningsWidget';
import { OnLeaveWidget } from './OnLeaveWidget';
import { StatusBreakdownWidget } from './StatusBreakdownWidget';
import { ScheduleCalendarWidget } from './ScheduleCalendarWidget';
import { NearingEndWidget } from './NearingEndWidget';
import { IncompleteDocumentsWidget } from './IncompleteDocumentsWidget';
import { TraineeGrowthWidget } from './TraineeGrowthWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';
import { OngoingTasksWidget } from './OngoingTasksWidget';
import { RecentBatchesWidget } from './RecentBatchesWidget';
import { PendingRegistrationsWidget } from './PendingRegistrationsWidget';

function formatToday(): string {
    return new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function DashboardPage() {
    return (
        <div>
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
                <p className="text-sm text-neutral-500">
                    Overview across all active programs · {formatToday()}
                </p>
            </div>

            <MetricsRow />

            <div className="mb-4">
                <PendingRegistrationsWidget />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <OnLeaveWidget />
                <StatusBreakdownWidget />
                <ScheduleCalendarWidget />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <NearingEndWidget />
                    <IncompleteDocumentsWidget />
                    <TraineeGrowthWidget />
                    <AnnouncementsWidget />
                </div>

                <div className="flex flex-col gap-4">
                    <EarningsWidget />
                    <OngoingTasksWidget />
                    <RecentBatchesWidget />
                </div>
            </div>
        </div>
    );
}
