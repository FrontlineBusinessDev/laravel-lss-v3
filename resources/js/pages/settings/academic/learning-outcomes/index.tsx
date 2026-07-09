import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, { CardActions } from '@/components/table';
import { cn } from '@/lib/utils';
import { StatusKind } from '@/types';
import {
    AcademicLearningOutcomes,
    columns,
    fields,
} from '@/types/modules/settings/academic/learning-outcomes';
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

const renderRow = (row: AcademicLearningOutcomes, actions: CardActions) => {
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
                <span className="truncate">{row.learning_outcomes}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.academic_industry_id}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="truncate">{row.academic_program_id}</span>
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
            <DataTableField<AcademicLearningOutcomes>
                apiUrl="/settings/academic/learning-outcomes"
                apiQueryKey="settings-academic/learning-outcomes"
                actionsCreateClassName="mt-2 sm:mt-0 ml-5"
                columns={columns}
                fields={fields}
                createLabel="Add Learning Outcomes"
                modalTitle={(s) =>
                    s.mode === 'create'
                        ? 'Add Learning Outcomes'
                        : 'Edit Learning Outcomes'
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
