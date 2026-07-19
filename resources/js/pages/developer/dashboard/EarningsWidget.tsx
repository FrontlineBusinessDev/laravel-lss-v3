import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { EarningsCard } from '@/components/EarningsCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

/** Thin wrapper fetching total earnings for the shared EarningsCard (its eye-icon toggle is local state, no route). */
export function EarningsWidget() {
    const { data } = useDashboardWidget(
        () => adminDashboardService.getMetrics(),
        [],
    );

    return <EarningsCard amount={data?.total_earnings ?? 0} />;
}
