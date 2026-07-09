import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, { CardActions } from '@/components/table';
import { cn } from '@/lib/utils';
import { StatusKind } from '@/types';
import {
    columns,
    fields,
    AcademicProgram,
} from '@/types/modules/settings/academic/program';
import { GRID } from '@/types/reusable/data-table';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';

const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';

const listHeader = (
    <div
        className={cn(
            GRID,
            customGRID,
            'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500',
        )}
    >
        <span>Name</span>
        <span>Course Name</span>
        <span>Specialization</span>
        <span />
    </div>
);

const renderRow = (row: AcademicProgram, actions: CardActions) => {
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
                customGRID,
                isArchived && 'opacity-60',
            )}
        >
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.name}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.course_name}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.specialization}</span>
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
            <DataTableField<AcademicProgram>
                apiUrl="/settings/academic/program"
                apiQueryKey="settings-academic/program"
                actionsCreateClassName="mt-2 sm:mt-0 ml-5"
                columns={columns}
                fields={fields}
                createLabel="Add Program"
                modalTitle={(s) =>
                    s.mode === 'create' ? 'Add Program' : 'Edit Program'
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
