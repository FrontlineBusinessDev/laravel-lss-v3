import { UsersRound } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import type { StatusKind } from '@/types/reusable/status-kind';

/** The 4 most recently created batches. */
export function RecentBatchesWidget() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getRecentBatches(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Recent batches"
            icon={UsersRound}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No batches yet."
            className="max-h-82 min-h-82"
        >
            <ul className="flex flex-col gap-1.5">
                {rows.map((batch) => (
                    <li key={batch.id}>
                        <button
                            type="button"
                            onClick={() => navigate(`/batches/${batch.id}`)}
                            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
                        >
                            <div className="min-w-0">
                                <div className="truncate font-mono text-sm font-medium text-ink">
                                    {batch.batch_code}
                                </div>
                                <div className="truncate text-xs text-neutral-500">
                                    {batch.program_type ?? '—'}
                                </div>
                            </div>
                            <StatusBadge status={batch.status as StatusKind} />
                        </button>
                    </li>
                ))}
            </ul>
        </DashboardWidgetCard>
    );
}
