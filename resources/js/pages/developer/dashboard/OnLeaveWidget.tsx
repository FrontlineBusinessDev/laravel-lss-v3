import { CalendarOff } from 'lucide-react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    });
}

/** Trainees currently on approved leave, across every batch. */
export function OnLeaveWidget() {
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getOnLeaveTrainees(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Trainees on leave"
            icon={CalendarOff}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No trainees currently on leave."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                    <li
                        key={row.trainee_id}
                        className="flex items-center justify-between text-sm"
                    >
                        <div>
                            <span className="font-medium text-ink">
                                {row.name}
                            </span>
                            <span className="ml-1.5 text-xs text-neutral-500">
                                {row.batch_code}
                            </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                            {row.leave_type ?? 'Leave'} · back{' '}
                            {formatDate(row.return_date)}
                        </span>
                    </li>
                ))}
            </ul>
        </DashboardWidgetCard>
    );
}
