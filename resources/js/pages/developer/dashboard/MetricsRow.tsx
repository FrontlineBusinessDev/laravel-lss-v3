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
                value={isLoading ? '—' : (data?.total_batches ?? 0)}
                icon={UsersRound}
                hint={
                    error ??
                    `${data?.active_batches ?? 0} currently active`
                }
            />
            <StatCard
                label="Total trainees"
                value={isLoading ? '—' : (data?.total_trainees ?? 0)}
                icon={GraduationCap}
                tone="accent"
                hint={error ?? 'Across all batches, all time'}
            />
            <StatCard
                label="Ongoing trainees"
                value={isLoading ? '—' : (data?.ongoing_trainees ?? 0)}
                icon={Activity}
                tone="success"
                hint={error ?? `${data?.active_batches ?? 0} active batches`}
            />
            <StatCard
                label="Overall LS program rating"
                value={isLoading ? '—' : (data?.average_rating ?? 0).toFixed(1)}
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
