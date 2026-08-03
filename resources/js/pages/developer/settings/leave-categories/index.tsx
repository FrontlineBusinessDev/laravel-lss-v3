import { useGlobalModal } from '@/components/global-modal';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import DataTableCardField from '@/components/table/DataTableCardField';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { LeaveCategories } from '@/types/modules/settings/leave-categories';
import { columns } from '@/types/modules/settings/leave-categories';
import LeaveCategoryModal from './LeaveCategoryModal';
import { StatusBadge } from '@/components/StatusBadge';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import { RowMenuAction } from '@/components/RowMenu';
import type { CardActions } from '@/components/table';

const PERMISSION = 'manage leave';

const GRID = 'sm:grid-cols-[1.6fr_1fr_1.2fr_1.2fr_1fr_2.5rem]!';
const listHeader = (
    <SettingsListHeader
        grid={GRID}
        labels={[
            'Category',
            'Max Days',
            'Max instances',
            'Is Required Document',
            'Status',
        ]}
        data-cy="index-settings-list-header-1"
    />
);

export default function LeaveCategoriesPage() {
    const modal = useGlobalModal<LeaveCategories | null>('leaveCategory', null);

    const renderRow = (row: LeaveCategories, actions: CardActions) => {
        const nonActive = row.status !== 'active';
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
            nonActive
                ? {
                      label: 'Delete',
                      icon: Trash2,
                      danger: true,
                      onClick: () => void actions.onDelete(),
                      disabled: !actions.canDelete || !nonActive,
                  }
                : {
                      label: 'Edit',
                      icon: Pencil,
                      onClick: actions.onEdit,
                      disabled: !actions.canEdit,
                  },
        ];

        return (
            <div key={row.id}>
                <SettingsRow
                    grid={GRID}
                    isArchived={nonActive}
                    badge={
                        <StatusBadge
                            status={
                                row.status === 'active' ? 'active' : 'archived'
                            }
                        />
                    }
                    menu={menu}
                    data-cy="index-settings-row-1"
                >
                    <TextCell muted={false} className="truncate">
                        {row.name}
                    </TextCell>
                    <TextCell muted={false} className="truncate">
                        {row.max_days}
                    </TextCell>
                    <TextCell muted={false} className="truncate">
                        {row.max_instances}
                    </TextCell>
                    <TextCell muted={false} className="truncate">
                        {row.requires_document ? 'Yes' : 'No'}
                    </TextCell>
                </SettingsRow>
            </div>
        );
    };

    return (
        <SettingsPrimaryLayout
            actionNode={
                <AddRecordButton
                    label="Add category"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            }
        >
            <DataTableCardField<LeaveCategories>
                apiUrl="/settings/leave-categories"
                apiQueryKey="settings-leave-categories"
                columns={columns}
                defaultSortBy="name"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                listHeader={listHeader}
                renderCard={renderRow}
            />
            <LeaveCategoryModal
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </SettingsPrimaryLayout>
    );
}
