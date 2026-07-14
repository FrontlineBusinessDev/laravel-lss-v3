import { academicLevelService } from '@/api-service-layer/admin/academic';
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
import type { AcademicLevel } from '@/types/modules/settings/academic/level';
import { columns, fields } from '@/types/modules/settings/academic/level';

const PERMISSION = 'manage settings academic';
const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Year Level', 'Description']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AcademicLevel, actions: CardActions) => {
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
            <TextCell data-cy="index-text-cell-5">{row.year_level}</TextCell>
            <TextCell data-cy="index-text-cell-6">{row.description}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    const { toast } = useToast();
    const modal = useGlobalModal<AcademicLevel | null>('academicLevel', null);
    const isEdit = modal.data !== null;

    return (
        <>
            <div className="float-right">
                <AddRecordButton
                    label="Add Level"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <DataTableCardField<AcademicLevel>
                apiUrl="/settings/academic/level"
                apiQueryKey="settings-academic/level"
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
                data-cy="index-data-table-field-7"
            />
            <FormModal<AcademicLevel>
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                title={isEdit ? 'Edit Level' : 'Add Level'}
                mode={isEdit ? 'edit' : 'create'}
                row={modal.data ?? undefined}
                fields={fields}
                submitLabel={isEdit ? 'Update Level' : 'Create Level'}
                cancelLabel={'Cancel'}
                mutationFn={(payload) =>
                    isEdit && modal.data
                        ? academicLevelService.update(
                              modal.data.id,
                              payload as Partial<AcademicLevel>,
                          )
                        : academicLevelService.create(
                              payload as Partial<AcademicLevel>,
                          )
                }
                invalidateKeys={tableListInvalidateKeys(
                    'settings-academic/level',
                )}
                onSuccess={() =>
                    toast({
                        title: isEdit ? 'Level updated' : 'Level created',
                        variant: 'success',
                    })
                }
            />
        </>
    );
}
