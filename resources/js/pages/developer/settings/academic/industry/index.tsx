import { academicIndustryService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { useGlobalModal } from '@/components/global-modal';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { StatusKind } from '@/types';
import type { AcademicIndustry } from '@/types/modules/settings/academic/industry';
import { columns, fields } from '@/types/modules/settings/academic/industry';

const PERMISSION = 'manage settings academic';
const customGRID = 'sm:grid-cols-[1.6fr_2.2fr_1fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Description']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AcademicIndustry, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge={
                <StatusBadge status={badge} data-cy="index-status-badge-3" />
            }
            menu={buildRecordMenu(actions, isArchived)}
            data-cy="index-settings-row-2"
        >
            <TextCell data-cy="index-text-cell-4">{row.name}</TextCell>
            <TextCell data-cy="index-text-cell-5">{row.description}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    const { toast } = useToast();
    const modal = useGlobalModal<AcademicIndustry | null>(
        'academicIndustry',
        null,
    );
    const isEdit = modal.data !== null;

    return (
        <>
            <div className="float-right">
                <AddRecordButton
                    label="Add Industry"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <DataTableCardField<AcademicIndustry>
                apiUrl="/settings/academic/industry"
                apiQueryKey="settings-academic/industry"
                columns={columns}
                defaultSortBy="first_name"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                listHeader={listHeader}
                renderCard={renderRow}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                data-cy="index-data-table-field-6"
            />
            <FormModal<AcademicIndustry>
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                title={isEdit ? 'Edit Industry' : 'Add Industry'}
                mode={isEdit ? 'edit' : 'create'}
                row={modal.data ?? undefined}
                fields={fields}
                submitLabel={isEdit ? 'Update Industry' : 'Create Industry'}
                cancelLabel={'Cancel'}
                mutationFn={(payload) =>
                    isEdit && modal.data
                        ? academicIndustryService.update(
                              modal.data.id,
                              payload as Partial<AcademicIndustry>,
                          )
                        : academicIndustryService.create(
                              payload as Partial<AcademicIndustry>,
                          )
                }
                invalidateKeys={tableListInvalidateKeys(
                    'settings-academic/industry',
                )}
                onSuccess={() =>
                    toast({
                        title: isEdit ? 'Industry updated' : 'Industry created',
                        variant: 'success',
                    })
                }
            />
        </>
    );
}
