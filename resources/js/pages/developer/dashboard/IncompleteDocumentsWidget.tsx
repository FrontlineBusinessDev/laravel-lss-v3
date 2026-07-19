import { FileWarning, ChevronRight } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function formatDocType(value: string): string {
    return value
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

/** Trainees (across every batch) missing one or more required documents. */
export function IncompleteDocumentsWidget() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getDocumentPendingTrainees(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Trainees with incomplete documents"
            icon={FileWarning}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="All trainees have complete documents."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                    <li
                        key={row.trainee_id}
                        className="flex items-center justify-between gap-3 text-sm"
                    >
                        <div className="min-w-0">
                            <div className="truncate font-medium text-ink">
                                {row.name}
                                <span className="ml-1.5 text-xs text-neutral-500">
                                    {row.batch_code}
                                </span>
                            </div>
                            <p className="text-danger-700 truncate text-xs">
                                Missing:{' '}
                                {row.missing_types
                                    .map(formatDocType)
                                    .join(', ')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/trainees/${row.trainee_id}`)
                            }
                            className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
                        >
                            View <ChevronRight size={12} />
                        </button>
                    </li>
                ))}
            </ul>
        </DashboardWidgetCard>
    );
}
