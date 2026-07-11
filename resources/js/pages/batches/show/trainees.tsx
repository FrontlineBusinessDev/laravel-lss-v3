import { SettingsListHeader, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField from '@/components/table';
import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types';
import type { AppBatches } from '@/types/modules/batches/batches';
import { columns, type TraineeRow } from '@/types/modules/batches/trainees';
import { GRID } from '@/types/reusable/data-table';

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
        />
    );

    const renderRow = (row: TraineeRow) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const badge = TRAINEE_STATUS[row.status] ?? 'active';

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    GRID,
                    TRAINEE_GRID,
                    row.status !== 'active' && 'opacity-60',
                )}
            >
                <div className="flex items-center gap-2 font-medium text-ink">
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-semibold text-brand-700">
                        {initialsOf(name)}
                    </span>
                    <span className="truncate">{name}</span>
                </div>
                <TextCell muted>{row.school?.school_name ?? '—'}</TextCell>
                <TextCell muted>{row.required_hours ?? '—'} hrs</TextCell>
                <StatusBadge status={badge} />
                <div />
            </div>
        );
    };

    return (
        <BatchDetailLayout batch={record} registrationUrl={registrationUrl}>
            <DataTableField<TraineeRow>
                apiUrl={`/batches/${record.id}/trainees`}
                apiQueryKey={['batch-trainees', String(record.id)]}
                columns={columns}
                enableCreate={false}
                defaultSortBy="first_name"
                listHeader={listHeader}
                renderCard={renderRow}
            />
        </BatchDetailLayout>
    );
}
