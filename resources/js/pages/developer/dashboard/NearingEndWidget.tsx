import { Clock } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { cn } from '@/lib/utils';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function daysUntil(dateStr: string): number {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}

/** Batches (and their trainee counts) whose projected end date falls within the next 14 days. */
export function NearingEndWidget() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getUpcomingEnds(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Nearing training end date"
            icon={Clock}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No batches ending within the next 2 weeks."
            className="max-h-28.5 min-h-28.5"
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => {
                    const daysLeft = row.projected_end_date
                        ? daysUntil(row.projected_end_date)
                        : 0;

                    return (
                        <li key={row.batch_id}>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/batches/${row.batch_id}`)
                                }
                                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-ink">
                                        {row.batch_code}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {row.trainee_count} trainee
                                        {row.trainee_count === 1 ? '' : 's'} ·
                                        ends{' '}
                                        {formatDate(row.projected_end_date)}
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                        daysLeft <= 3
                                            ? 'bg-danger-50 text-danger-800'
                                            : 'bg-warning-50 text-warning-800',
                                    )}
                                >
                                    {daysLeft <= 0
                                        ? 'Ends today'
                                        : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </DashboardWidgetCard>
    );
}
