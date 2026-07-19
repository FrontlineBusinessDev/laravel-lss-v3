import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardWidgetCardProps {
    title: string;
    icon: LucideIcon;
    isLoading: boolean;
    error: string | null;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
    className?: string;
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-100" />
        </div>
    );
}

/**
 * Shared chrome for every trainer dashboard widget: title/icon header +
 * loading/error/empty states, wrapping the widget's own content. Each widget
 * fetches its own data via useDashboardWidget and passes the resulting state
 * straight through as props.
 */
export function DashboardWidgetCard({
    title,
    icon: Icon,
    isLoading,
    error,
    isEmpty,
    emptyMessage,
    children,
    className,
}: DashboardWidgetCardProps) {
    return (
        <div
            className={cn(
                'rounded-lg border border-neutral-200 bg-white p-4',
                className,
            )}
        >
            <div className="mb-3 flex items-center gap-2">
                <Icon size={16} className="text-brand-500" />
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
            </div>

            {isLoading ? (
                <LoadingSkeleton />
            ) : error ? (
                <p className="text-danger-700 rounded-md bg-danger-50 px-2 py-1.5 text-xs">
                    {error}
                </p>
            ) : isEmpty ? (
                <p className="text-xs text-neutral-500">{emptyMessage}</p>
            ) : (
                children
            )}
        </div>
    );
}
