import { memo } from 'react';
import { cn } from '@/lib/utils';

const PILL_BASE =
    'inline-flex w-fit items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs leading-5 font-medium';

export const TaskCompletedPill = memo(function TaskCompletedPill({
    className,
}: {
    className?: string;
}) {
    return (
        <span
            className={cn(PILL_BASE, 'bg-success-50 text-success-800', className)}
            data-cy="task-completed-pill"
        >
            Task Completed
        </span>
    );
});

export const RequiredHoursCompletedPill = memo(
    function RequiredHoursCompletedPill({
        className,
    }: {
        className?: string;
    }) {
        return (
            <span
                className={cn(
                    PILL_BASE,
                    'bg-brand-50 text-brand-700',
                    className,
                )}
                data-cy="required-hours-completed-pill"
            >
                Required Hours Completed
            </span>
        );
    },
);
