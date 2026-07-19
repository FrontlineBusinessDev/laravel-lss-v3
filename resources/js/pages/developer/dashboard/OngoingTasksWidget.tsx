import { ListTodo } from 'lucide-react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import type { TaskPriority } from '@/types/task';

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    });
}

/** Active (not-yet-completed) tasks across every batch. */
export function OngoingTasksWidget() {
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getOngoingTasks(),
        [],
    );
    const rows = data?.tasks ?? [];
    const remaining = Math.max(0, (data?.total ?? 0) - rows.length);

    return (
        <DashboardWidgetCard
            title="Ongoing tasks"
            icon={ListTodo}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No ongoing tasks right now."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                    <li key={row.id} className="flex items-center gap-2">
                        <TaskPriorityBadge
                            priority={row.priority as TaskPriority | null}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">
                                {row.task}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                                {row.trainee_name} · {row.batch_code}
                            </p>
                        </div>
                        <span className="shrink-0 text-xs text-neutral-400">
                            {formatDate(row.date)}
                        </span>
                    </li>
                ))}
            </ul>
            {remaining > 0 && (
                <p className="mt-2 text-xs text-neutral-400">
                    +{remaining} more
                </p>
            )}
        </DashboardWidgetCard>
    );
}
