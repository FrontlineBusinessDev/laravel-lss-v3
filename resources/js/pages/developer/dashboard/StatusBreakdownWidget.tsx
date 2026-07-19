import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DonutChart } from '@/components/DonutChart';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

/** Trainee status breakdown (active/completed/terminated/archived) feeding the shared DonutChart. */
export function StatusBreakdownWidget() {
    const { data } = useDashboardWidget(
        () => adminDashboardService.getStatusBreakdown(),
        [],
    );
    const total =
        (data?.active ?? 0) +
        (data?.completed ?? 0) +
        (data?.terminated ?? 0) +
        (data?.archived ?? 0);

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5 transition-colors hover:border-neutral-300">
            <h2 className="mb-3 text-xs text-neutral-500">
                Trainee status breakdown
            </h2>
            <DonutChart
                centerValue={total}
                centerLabel="total trainees"
                segments={[
                    {
                        label: 'Active',
                        value: data?.active ?? 0,
                        color: '#2176E3',
                    },
                    {
                        label: 'Completed',
                        value: data?.completed ?? 0,
                        color: '#639922',
                    },
                    {
                        label: 'Terminated',
                        value: data?.terminated ?? 0,
                        color: '#E24B4A',
                    },
                    {
                        label: 'Archived',
                        value: data?.archived ?? 0,
                        color: '#9AA2AB',
                    },
                ]}
            />
        </div>
    );
}
