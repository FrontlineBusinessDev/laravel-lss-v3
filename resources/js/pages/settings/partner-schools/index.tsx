import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, { CardActions } from '@/components/table';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import { cn } from '@/lib/utils';
import { StatusKind } from '@/types';
import {
    columns,
    fields,
    PartnerSchools,
} from '@/types/modules/settings/partner-schools';
import { GRID } from '@/types/reusable/data-table';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';

const listHeader = (
    <div
        className={cn(
            GRID,
            'sm:grid-cols-[1fr_1.6fr_2.2fr_1.2fr_0.9fr_2.5rem]',
            'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500',
        )}
    >
        <span>School Name</span>
        <span>Abbrevation</span>
        <span>Contact Name</span>
        <span>Email</span>
        <span>Status</span>
        <span />
    </div>
);

const renderRow = (row: PartnerSchools, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';
    const menu: RowMenuAction[] = [
        {
            label: 'Edit',
            icon: Pencil,
            onClick: actions.onEdit,
            disabled: !actions.canEdit,
        },
        isArchived
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
        isArchived
            ? {
                  label: 'Delete',
                  icon: Trash2,
                  danger: true,
                  onClick: () => void actions.onDelete(),
                  disabled: !actions.canDelete,
              }
            : null,
    ];

    return (
        <div
            className={cn(
                'flex flex-col gap-1 px-4 py-3',
                GRID,
                'sm:grid-cols-[1fr_1.6fr_2.2fr_1.2fr_0.9fr_2.5rem]',
                isArchived && 'opacity-60',
            )}
        >
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.school_name}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.abbreviation}</span>
            </div>
            <div className="truncate text-xs text-neutral-500">
                {row.contact_first_name} {row.contact_last_name}
            </div>
            <div className="truncate text-xs text-neutral-500">
                {row.contact_email}
            </div>
            <div className="flex items-center justify-between sm:contents">
                <StatusBadge status={badge} />
                <div className="sm:justify-self-end">
                    <RowMenu actions={menu} />
                </div>
            </div>
        </div>
    );
};

export default function index() {
    return (
        <>
            <SettingsPrimaryLayout>
                <DataTableField<PartnerSchools>
                    apiUrl="/settings/partner-schools"
                    apiQueryKey="settings-partner-schools"
                    actionsCreateClassName="float-none ml-5"
                    columns={columns}
                    fields={fields}
                    createLabel="Add Partner School"
                    modalTitle={(s) =>
                        s.mode === 'create'
                            ? 'Add Partner School'
                            : 'Edit Partner School'
                    }
                    defaultSortBy="first_name"
                    createPermission="manage settings partner schools"
                    editPermission="manage settings partner schools"
                    archivePermission="manage settings partner schools"
                    deletePermission="manage settings partner schools"
                    listHeader={listHeader}
                    renderCard={renderRow}
                />
            </SettingsPrimaryLayout>
        </>
    );
}
