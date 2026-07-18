import { apiFetchJson } from '@/lib/apiFetch';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { FieldOption } from '@/types/reusable/fields';

export interface TraineeRatingEvaluator {
    id: number;
    first_name: string;
    last_name: string;
}

/** Row shape returned by `/trainee/ratings/pagination-search`. */
export interface TraineeTaskRatingRow extends Record<string, unknown> {
    id: number;
    batch_id: number;
    task_name: string;
    description: string | null;
    hours_spent: string | null;
    rating: number;
    comments: string | null;
    rated_at: string;
    evaluator: TraineeRatingEvaluator | null;
}

export interface TraineeRatingMetrics {
    total_rated: number;
    average_rating: number | null;
}

const evaluatorName = (row: TraineeTaskRatingRow) =>
    row.evaluator
        ? `${row.evaluator.first_name} ${row.evaluator.last_name}`
        : '—';

export const columns: ColumnDef<TraineeTaskRatingRow>[] = [
    {
        key: 'task_name',
        label: 'Task',
        searchable: true,
    },
    {
        key: 'description',
        label: 'Description',
        render: (value) => (value as string | null) ?? '—',
    },
    {
        key: 'rated_at',
        label: 'Date created',
        sortable: true,
        filterable: true,
        type: 'date-range',
        render: (value) => (value as string).slice(0, 10),
    },
    {
        key: 'hours_spent',
        label: 'Hours spent',
        render: (value) => (value != null ? `${Number(value)}h` : '—'),
    },
    {
        key: 'evaluator',
        label: 'Trainer',
        filterable: true,
        type: 'async-select',
        loadOptions: async (q: string): Promise<FieldOption[]> => {
            const res = await apiFetchJson<TraineeRatingEvaluator[]>(
                '/trainee/ratings/trainers',
            );
            const items = res.data ?? [];
            const filtered = q
                ? items.filter((t) =>
                      `${t.first_name} ${t.last_name}`
                          .toLowerCase()
                          .includes(q.toLowerCase()),
                  )
                : items;

            return filtered.map((t) => ({
                value: String(t.id),
                label: `${t.first_name} ${t.last_name}`,
            }));
        },
        render: (_value, row) => evaluatorName(row),
    },
    {
        key: 'rating',
        label: 'Grade',
        sortable: true,
        render: (value) => `${value}/100`,
    },
    {
        key: 'comments',
        label: 'Remarks',
        render: (value) => (value as string | null) ?? '—',
    },
];
