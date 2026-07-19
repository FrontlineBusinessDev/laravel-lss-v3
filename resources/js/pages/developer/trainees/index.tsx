import { router } from '@inertiajs/react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { RowMenuAction } from '@/components/RowMenu';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { StatusKind } from '@/types';
import type { AppTrainees } from '@/types/modules/trainees/trainees';
import { columns } from '@/types/modules/trainees/trainees';

const PERMISSION = 'manage trainees';

const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_2fr_1fr_1.2fr_2.5rem]!';

const listHeader = (
    <SettingsListHeader
        grid={TRAINEE_GRID}
        labels={['Full name', 'Email', 'Required hrs', 'Status']}
        data-cy="index-settings-list-header-1"
    />
);

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

export default function TraineesListPage() {
    const renderRow = (row: AppTrainees, actions: CardActions) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const completed = Boolean(row.date_completed);
        const nonActive = row.status !== 'active';
        const badge = STATUS_BADGE[row.status] ?? 'active';

        const menu: RowMenuAction[] = [
            nonActive
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive,
                  },
            {
                label: 'Delete',
                icon: Trash2,
                danger: true,
                onClick: () => void actions.onDelete(),
                disabled: !actions.canDelete || !nonActive,
            },
        ];

        return (
            <div
                role="link"
                tabIndex={0}
                onClick={() => router.visit(`/trainees/${row.id}`)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        router.visit(`/trainees/${row.id}`);
                    }
                }}
                className="cursor-pointer transition-colors hover:bg-neutral-50/70"
                data-cy="index-div-row"
            >
                <SettingsRow
                    grid={TRAINEE_GRID}
                    isArchived={nonActive}
                    badge={
                        <StatusBadge
                            status={completed ? 'completed' : badge}
                            data-cy="index-status-badge"
                        />
                    }
                    menu={menu}
                    data-cy="index-settings-row-1"
                >
                    <div
                        className="flex items-center gap-2.5 font-medium text-ink"
                        data-cy="index-div-name"
                    >
                        <Avatar
                            src={row.avatar_url}
                            name={name}
                            initials={row.initials}
                            size="sm"
                            data-cy="index-avatar"
                        />
                        <span className="truncate" data-cy="index-span-name">
                            {name}
                        </span>
                    </div>
                    <TextCell muted data-cy="index-text-cell-email">
                        {row.email}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-hrs">
                        {row.required_hours ?? '—'} hrs
                    </TextCell>
                </SettingsRow>
            </div>
        );
    };

    return (
        <>
            <h1
                className="text-xl font-semibold text-ink"
                data-cy="index-h1-trainees"
            >
                Trainees
            </h1>
            <p
                className="mb-4 text-sm text-neutral-500"
                data-cy="index-p-manage-trainees"
            >
                Manage Trainees data.
            </p>
            <DataTableCardField<AppTrainees>
                apiUrl="/trainees"
                apiQueryKey="trainees"
                columns={columns}
                defaultSortBy="last_name"
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                deleteConfirmText={(row) =>
                    `${row.first_name} ${row.last_name}`.trim()
                }
                listHeader={listHeader}
                renderCard={renderRow}
                data-cy="index-data-table-field-1"
            />
        </>
    );
}
