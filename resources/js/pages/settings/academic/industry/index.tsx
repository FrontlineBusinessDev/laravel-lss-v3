import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, { CardActions } from '@/components/table';
import { cn } from '@/lib/utils';
import { StatusKind } from '@/types';
import {
    AcademicIndustry,
    columns,
    fields,
} from '@/types/modules/settings/academic/industry';
import { GRID } from '@/types/reusable/data-table';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';

const customGRID = 'sm:grid-cols-[1.6fr_2.2fr_2.5rem]';

const listHeader = (
    <div
        className={cn(
            GRID,
            customGRID,
            'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500',
        )}
    >
        <span>Name</span>
        <span>Description</span>
        <span />
    </div>
);

const renderRow = (row: AcademicIndustry, actions: CardActions) => {
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
                // customGRID,
                isArchived && 'opacity-60',
            )}
        >
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.name}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.description}</span>
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
            <DataTableField<AcademicIndustry>
                apiUrl="/settings/academic/industry"
                apiQueryKey="settings-academic/industry"
                actionsCreateClassName="mt-2 sm:mt-0 ml-5"
                columns={columns}
                fields={fields}
                createLabel="Add Industry"
                modalTitle={(s) =>
                    s.mode === 'create' ? 'Add Industry' : 'Edit Industry'
                }
                defaultSortBy="first_name"
                createPermission="manage settings academic"
                editPermission="manage settings academic"
                archivePermission="manage settings academic"
                deletePermission="manage settings academic"
                listHeader={listHeader}
                renderCard={renderRow}
            />
        </>
    );
}
