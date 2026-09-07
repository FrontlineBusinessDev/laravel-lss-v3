import { Activity, GraduationCap, Star, UsersRound } from 'lucide-react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { StatCard } from '@/components/StatCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

/** Top-line metric cards: total batches, total trainees, ongoing trainees, and the program rating (AVG of BehavioralEvaluation.total_score). */
export function MetricsRow() {
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getMetrics(),
        [],
    );

    return (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
                label="Total batches"
                value={data?.total_batches ?? 0}
                loading={isLoading}
                icon={UsersRound}
                hint={
                    error ??
                    `${data?.active_batches ?? 0} currently active`
                }
            />
            <StatCard
                label="Total trainees"
                value={data?.total_trainees ?? 0}
                loading={isLoading}
                icon={GraduationCap}
                tone="accent"
                hint={error ?? 'Across all batches, all time'}
            />
            <StatCard
                label="Ongoing trainees"
                value={data?.ongoing_trainees ?? 0}
                loading={isLoading}
                icon={Activity}
                tone="success"
                hint={error ?? `${data?.active_batches ?? 0} active batches`}
            />
            <StatCard
                label="Overall LS program rating"
                value={(data?.average_rating ?? 0).toFixed(1)}
                loading={isLoading}
                icon={Star}
                tone="warning"
                hint={
                    error ??
                    `${data?.total_ratings ?? 0} evaluation${data?.total_ratings === 1 ? '' : 's'} recorded`
                }
            />
        </div>
    );
}
