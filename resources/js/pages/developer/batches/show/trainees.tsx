import { SettingsListHeader, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types';
import type { AppBatches } from '@/types/modules/batches/batches';
import type { TraineeRow } from '@/types/modules/batches/trainees';
import { columns } from '@/types/modules/batches/trainees';
import { GRID } from '@/types/reusable/data-table';
import { Link } from '@inertiajs/react';

const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_1.4fr_0.9fr_0.9fr_2.5rem]!';
const TRAINEE_STATUS: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};
function initialsOf(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '—'
    );
}
interface Props {
    record: AppBatches;
    registrationUrl: string;
}
export default function BatchTraineesPage({ record, registrationUrl }: Props) {
    const listHeader = (
        <SettingsListHeader
            grid={TRAINEE_GRID}
            labels={['Trainee', 'School', 'Required hrs', 'Status']}
            data-cy="trainees-settings-list-header-1"
        />
    );

    const renderRow = (row: TraineeRow) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const badge = TRAINEE_STATUS[row.status] ?? 'active';

        return (
            <Link
                href={`/trainees/${row.id}`}
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    'hover:bg-slate-50',
                    GRID,
                    TRAINEE_GRID,
                    row.status !== 'active' && 'opacity-60',
                )}
                data-cy="trainees-div-2"
            >
                <div
                    className="flex items-center gap-2 font-medium text-ink"
                    data-cy="trainees-div-3"
                >
                    <span
                        className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-semibold text-brand-700"
                        data-cy="trainees-span-4"
                    >
                        {initialsOf(name)}
                    </span>
                    <span className="truncate" data-cy="trainees-span-5">
                        {name}
                    </span>
                </div>
                <TextCell muted data-cy="trainees-text-cell-6">
                    {row.school?.school_name ?? '—'}
                </TextCell>
                <TextCell muted data-cy="trainees-text-cell-7">
                    {row.required_hours ?? '—'} hrs
                </TextCell>
                <StatusBadge status={badge} data-cy="trainees-status-badge-8" />
                <div data-cy="trainees-div-9" />
            </Link>
        );
    };

    return (
        <BatchDetailLayout
            batch={record}
            registrationUrl={registrationUrl}
            data-cy="trainees-batch-detail-layout-10"
        >
            <DataTableCardField<TraineeRow>
                apiUrl={`/batches/${record.id}/trainees`}
                apiQueryKey={['batch-trainees', String(record.id)]}
                columns={columns}
                defaultSortBy="first_name"
                listHeader={listHeader}
                renderCard={renderRow}
                data-cy="trainees-data-table-field-11"
            />
        </BatchDetailLayout>
    );
}
