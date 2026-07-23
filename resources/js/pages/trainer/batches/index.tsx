import { router } from '@inertiajs/react';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import type { StatusKind } from '@/types/reusable/status-kind';
import type { AppBatches } from '@/types/modules/batches/batches';
import { columns } from '@/types/modules/batches/batches';

const customGRID = 'sm:grid-cols-[0.9fr_1.4fr_1.2fr_0.7fr_0.6fr]!';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Batch Code', 'Program', 'Industry', 'Setup', 'Trainees']}
    />
);

const STATUS_BADGE: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

/** Read-only: no create/edit/archive/delete affordances for this role. */
export default function TrainerBatchesPage() {
    const renderRow = (row: AppBatches) => {
        const badge: StatusKind = STATUS_BADGE[row.status] ?? 'active';

        return (
            <div
                role="link"
                tabIndex={0}
                onClick={() => router.visit(`/trainer/batches/${row.id}`)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        router.visit(`/trainer/batches/${row.id}`);
                    }
                }}
                className={`grid ${customGRID} cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/70`}
            >
                <TextCell>{row.batch_code}</TextCell>
                <TextCell muted>{row.academic_program?.name ?? '—'}</TextCell>
                <TextCell muted>
                    {row.academic_industry?.name ?? '—'}
                </TextCell>
                <TextCell muted>
                    {row.setup === 'f2f' ? 'F2F' : 'Online'}
                </TextCell>
                <div className="flex items-center justify-between gap-2">
                    <TextCell muted>{row.trainees_count ?? 0}</TextCell>
                    <StatusBadge status={badge} />
                </div>
            </div>
        );
    };

    return (
        <TrainerLayout title="Batches">
            <p className="mb-4 text-sm text-neutral-500">
                Batches you're assigned to.
            </p>
            <DataTableCardField<AppBatches>
                apiUrl="/trainer/batches"
                apiQueryKey="trainer-batches"
                columns={columns}
                defaultSortBy="batch_code"
                listHeader={listHeader}
                renderCard={renderRow}
            />
        </TrainerLayout>
    );
}
