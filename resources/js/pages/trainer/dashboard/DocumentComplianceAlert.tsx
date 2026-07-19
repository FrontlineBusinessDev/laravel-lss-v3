import { FileWarning } from 'lucide-react';
import { trainerDashboardService } from '@/api-service-layer/trainer/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function formatDocType(value: string): string {
    return value
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

/** Trainees (across assigned batches) missing one or more required documents. */
export function DocumentComplianceAlert() {
    const { data, isLoading, error } = useDashboardWidget(
        () => trainerDashboardService.getDocumentPendingTrainees(),
        [],
    );
    const rows = data ?? [];

    return (
        <DashboardWidgetCard
            title="Document Compliance"
            icon={FileWarning}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="All trainees have complete documents."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                    <li key={row.trainee_id} className="text-sm">
                        <div>
                            <span className="font-medium text-ink">
                                {row.name}
                            </span>
                            <span className="ml-1.5 text-xs text-neutral-500">
                                {row.batch_code}
                            </span>
                        </div>
                        <p className="text-danger-700 text-xs">
                            Missing:{' '}
                            {row.missing_types.map(formatDocType).join(', ')}
                        </p>
                    </li>
                ))}
            </ul>
        </DashboardWidgetCard>
    );
}
