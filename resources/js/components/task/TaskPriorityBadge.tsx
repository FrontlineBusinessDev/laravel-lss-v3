import type { TaskPriority } from '@/types/task';
import { cn } from '@/lib/utils';

const PRIORITY_STYLE: Record<TaskPriority, string> = {
    high: 'bg-danger-50 text-danger-800',
    medium: 'bg-warning-50 text-warning-800',
    low: 'bg-neutral-100 text-neutral-600',
};
const PRIORITY_LABEL: Record<TaskPriority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export function TaskPriorityBadge({
    priority,
    'data-cy': dataCy,
}: {
    priority: TaskPriority | null;
    'data-cy'?: string;
}) {
    if (!priority) {
        return <span className="text-xs text-neutral-400">—</span>;
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                PRIORITY_STYLE[priority],
            )}
            data-cy={dataCy}
        >
            {PRIORITY_LABEL[priority]}
        </span>
    );
}
