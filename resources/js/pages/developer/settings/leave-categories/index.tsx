import { useGlobalModal } from '@/components/global-modal';
import { AddRecordButton } from '@/components/settings';
import DataTableCardField from '@/components/table/DataTableCardField';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { LeaveCategories } from '@/types/modules/settings/leave-categories';
import { columns } from '@/types/modules/settings/leave-categories';
import LeaveCategoryModal from './LeaveCategoryModal';

const PERMISSION = 'manage leave';

export default function LeaveCategoriesPage() {
    const modal = useGlobalModal<LeaveCategories | null>('leaveCategory', null);

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
            />
            <LeaveCategoryModal
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </SettingsPrimaryLayout>
    );
}
