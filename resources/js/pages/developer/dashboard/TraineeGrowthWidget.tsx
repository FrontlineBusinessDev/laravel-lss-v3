import { Skeleton } from 'boneyard-js/react';
import { BarChart3 } from 'lucide-react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { YearlyTraineesChart } from '@/components/YearlyTraineesChart';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

/** Trainees accommodated per year (bucketed by enrollment record creation year). */
export function TraineeGrowthWidget() {
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getTraineeGrowth(),
        [],
    );
    const rows = data ?? [];

    return (
        <div className="rounded-lg border border-neutral-200 bg-white transition-colors duration-150 hover:border-neutral-300">
            <div className="flex items-center gap-1.5 border-b border-neutral-200 px-4 py-3">
                <BarChart3 size={15} className="text-neutral-400" />
                <h2 className="text-sm font-semibold text-ink">
                    Trainees accommodated per year
                </h2>
            </div>
            <div className="p-4">
                {error && !isLoading ? (
                    <p className="text-danger-700 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs">
                        {error}
                    </p>
                ) : rows.length === 0 && !isLoading ? (
                    <p className="py-5 text-center text-xs text-neutral-400">
                        No trainee data yet.
                    </p>
                ) : (
                    <Skeleton
                        name="trainee-growth-chart"
                        loading={isLoading}
                        fixture={
                            <span className="block h-28 rounded bg-neutral-100" />
                        }
                    >
                        <YearlyTraineesChart data={rows} />
                    </Skeleton>
                )}
            </div>
        </div>
    );
}
