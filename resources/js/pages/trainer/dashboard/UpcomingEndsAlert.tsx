import { AlertTriangle } from 'lucide-react';
import { trainerDashboardService } from '@/api-service-layer/trainer/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/** Batches (and trainee counts) whose projected end date falls within the next 14 days. */
export function UpcomingEndsAlert() {
    const { data, isLoading, error } = useDashboardWidget(
        () => trainerDashboardService.getUpcomingEnds(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Batches Ending Soon"
            icon={AlertTriangle}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No batches ending in the next 2 weeks."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                    <li
                        key={row.batch_id}
                        className="flex items-center justify-between rounded-md bg-warning-50 px-2.5 py-1.5"
                    >
                        <div>
                            <span className="text-sm font-medium text-ink">
                                {row.batch_code}
                            </span>
                            <span className="ml-1.5 text-xs text-neutral-500">
                                {row.trainee_count} trainee
                                {row.trainee_count === 1 ? '' : 's'}
                            </span>
                        </div>
                        <span className="text-warning-800 text-xs font-medium">
                            {formatDate(row.projected_end_date)}
                        </span>
                    </li>
                ))}
            </ul>
        </DashboardWidgetCard>
    );
}
