import { StatCard } from '@/components/StatCard';
import DataTableCardField from '@/components/table/DataTableCardField';
import { formatCell } from '@/components/table/utils';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import { apiFetchJson } from '@/lib/apiFetch';
import type { TraineeRatingMetrics } from '@/types/modules/ratings/trainee-task-rating';
import type { TraineeTaskRatingRow } from '@/types/modules/ratings/trainee-task-rating';
import { columns } from '@/types/modules/ratings/trainee-task-rating';
import { useEffect, useState } from 'react';

export default function TraineeRatingsPage() {
    const [metrics, setMetrics] = useState<TraineeRatingMetrics>({
        total_rated: 0,
        average_rating: null,
    });

    useEffect(() => {
        apiFetchJson<TraineeRatingMetrics>('/trainee/ratings/metrics')
            .then((res) =>
                res.data && setMetrics(res.data),
            )
            .catch(() => undefined);
    }, []);

    const renderRow = (row: TraineeTaskRatingRow) => (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                        ? col.render(row[col.key], row)
                        : formatCell(row[col.key])}
                </td>
            ))}
        </tr>
    );

    return (
        <TraineeLayout title="Ratings">
            <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <StatCard
                    label="Total rated tasks"
                    value={metrics.total_rated}
                />
                <StatCard
                    label="Average rating"
                    value={
                        metrics.average_rating != null
                            ? `${metrics.average_rating}/100`
                            : '—'
                    }
                    tone="accent"
                />
                <StatCard
                    label="Overall task rating"
                    value={
                        metrics.average_rating != null
                            ? `${metrics.average_rating}/100`
                            : '—'
                    }
                    tone="success"
                />
            </div>

            <h2 className="mb-3 text-sm font-semibold text-ink">
                Rated tasks
            </h2>
            <DataTableCardField<TraineeTaskRatingRow>
                apiUrl="/trainee/ratings"
                apiQueryKey="trainee-ratings-own"
                columns={columns}
                defaultSortBy="rated_at"
                defaultSortDir="desc"
                renderCard={renderRow}
            />
        </TraineeLayout>
    );
}
