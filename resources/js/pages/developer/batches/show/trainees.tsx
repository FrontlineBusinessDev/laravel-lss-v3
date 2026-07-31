import { useRef, useState } from 'react';
import { ArchiveRestore, Archive as ArchiveIcon, ShieldOff, Shuffle } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import BatchDetailLayout from '@/layouts/batches/BatchDetailLayout';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types/reusable/status-kind';
import type { AppBatches } from '@/types/modules/batches/batches';
import type { TraineeRow } from '@/types/modules/batches/trainees';
import { columns } from '@/types/modules/batches/trainees';
import { GRID } from '@/types/reusable/data-table';
import { Link } from '@inertiajs/react';
import { TransferTraineeModal } from './TransferTraineeModal';
import { TerminateTraineeModal } from './TerminateTraineeModal';

const PERMISSION = 'manage trainees';
const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_1.4fr_0.9fr_0.9fr_2.5rem]!';
const TRAINEE_STATUS: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};
interface Props {
    record: AppBatches;
    registrationUrl: string;
}
export default function BatchTraineesPage({ record, registrationUrl }: Props) {
    const [transferTarget, setTransferTarget] = useState<TraineeRow | null>(
        null,
    );
    const [terminateTarget, setTerminateTarget] = useState<TraineeRow | null>(
        null,
    );
    const refreshRef = useRef<(() => void) | undefined>(undefined);

    const listHeader = (
        <SettingsListHeader
            grid={TRAINEE_GRID}
            labels={['Trainee', 'School', 'Required hrs', 'Status']}
            data-cy="trainees-settings-list-header-1"
        />
    );

    const renderRow = (row: TraineeRow, actions: CardActions) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const badge = TRAINEE_STATUS[row.status] ?? 'active';
        const isArchived = row.status === 'inactive';
        const isTerminated = row.status === 'terminated';

        const menuActions: RowMenuAction[] = [
            !isTerminated && !isArchived
                ? {
                      label: 'Transfer',
                      icon: Shuffle,
                      onClick: () => setTransferTarget(row),
                  }
                : null,
            !isTerminated && !isArchived
                ? {
                      label: 'Terminate',
                      icon: ShieldOff,
                      danger: true,
                      onClick: () => setTerminateTarget(row),
                  }
                : null,
            isArchived
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: ArchiveIcon,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive || isTerminated,
                  },
        ];

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    'hover:bg-slate-50',
                    GRID,
                    TRAINEE_GRID,
                    row.status !== 'active' && 'opacity-60',
                )}
                data-cy="trainees-div-2"
            >
                <Link
                    href={`/trainees/${row.id}`}
                    className="flex items-center gap-2 font-medium text-ink"
                    data-cy="trainees-div-3"
                >
                    <Avatar
                        src={row.avatar_url}
                        name={name}
                        initials={row.initials}
                        size="sm"
                        data-cy="trainees-avatar-4"
                    />
                    <span className="truncate" data-cy="trainees-span-5">
                        {name}
                    </span>
                </Link>
                <TextCell muted data-cy="trainees-text-cell-6">
                    {row.school?.school_name ?? '—'}
                </TextCell>
                <TextCell muted data-cy="trainees-text-cell-7">
                    {row.required_hours ?? '—'} hrs
                </TextCell>
                <StatusBadge status={badge} data-cy="trainees-status-badge-8" />
                <RowMenu actions={menuActions} />
            </div>
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
                archivePermission={PERMISSION}
                archiveUrl={(row) => `/trainees/${row.id}/archive`}
                restoreUrl={(row) => `/trainees/${row.id}/restore`}
                listHeader={listHeader}
                renderCard={renderRow}
                onRefreshRef={(fn) => (refreshRef.current = fn)}
                data-cy="trainees-data-table-field-11"
            />
            <TransferTraineeModal
                open={transferTarget !== null}
                onClose={() => setTransferTarget(null)}
                trainee={transferTarget}
                currentBatchId={record.id}
                onTransferred={() => refreshRef.current?.()}
            />
            <TerminateTraineeModal
                open={terminateTarget !== null}
                onClose={() => setTerminateTarget(null)}
                trainee={terminateTarget}
                onTerminated={() => refreshRef.current?.()}
            />
        </BatchDetailLayout>
    );
}
