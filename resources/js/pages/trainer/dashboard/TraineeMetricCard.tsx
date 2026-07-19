import { Users } from 'lucide-react';
import { trainerDashboardService } from '@/api-service-layer/trainer/dashboard';
import { StatCard } from '@/components/StatCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

/** Prominent metric: total ongoing trainees across this trainer's assigned batches. */
export function TraineeMetricCard() {
    const { data, isLoading, error } = useDashboardWidget(
        () => trainerDashboardService.getDashboardMetrics(),
        [],
    );

    return (
        <StatCard
            label="Ongoing Trainees"
            value={isLoading ? '—' : (data?.ongoing_trainees ?? 0)}
            icon={Users}
            tone={error ? 'warning' : 'accent'}
            hint={error ?? 'Across your assigned batches'}
        />
    );
}
