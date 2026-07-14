import { partnerSchoolService } from '@/api-service-layer/admin/partner-school';
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
import { Thumbnail } from '@/components/Thumbnail';
import { useToast } from '@/hooks/use-toast';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { StatusKind } from '@/types';
import type { PartnerSchools } from '@/types/modules/settings/partner-schools';
import { columns, fields } from '@/types/modules/settings/partner-schools';

const PERMISSION = 'manage settings partner schools';
const customGRID = 'sm:grid-cols-[3rem_1fr_1.6fr_2.2fr_1.2fr_0.9fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={[
            'Logo',
            'School Name',
            'Abbreviation',
            'Contact Name',
            'Email',
            'Status',
        ]}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: PartnerSchools, actions: CardActions) => {
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
            // classNameParent="flex-row items-center gap-4"
            data-cy="index-settings-row-2"
        >
            <Thumbnail
                src={row.image}
                alt={`${row.school_name} logo`}
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                data-cy="index-thumbnail-4"
            />
            <TextCell data-cy="index-text-cell-5"> {row.school_name}</TextCell>
            <TextCell data-cy="index-text-cell-6">{row.abbreviation}</TextCell>
            <TextCell muted data-cy="index-text-cell-7">
                {row.contact_first_name} {row.contact_last_name}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-8">
                {row.contact_email}
            </TextCell>
        </SettingsRow>
    );
};

export default function index() {
    const { toast } = useToast();
    const modal = useGlobalModal<PartnerSchools | null>('partnerSchool', null);
    const isEdit = modal.data !== null;

    return (
        <>
            <SettingsPrimaryLayout data-cy="index-settings-primary-layout-9">
                <div className="flex w-full items-center justify-between">
                    <div></div>
                    <AddRecordButton
                        label="Add Partner School"
                        permission={PERMISSION}
                        onClick={() => {
                            modal.setData(null);
                            modal.setOpen(true);
                        }}
                    />
                </div>
                <DataTableCardField<PartnerSchools>
                    apiUrl="/settings/partner-schools"
                    apiQueryKey="settings-partner-schools"
                    columns={columns}
                    defaultSortBy="school_name"
                    editPermission={PERMISSION}
                    archivePermission={PERMISSION}
                    deletePermission={PERMISSION}
                    listHeader={listHeader}
                    renderCard={renderRow}
                    onEditRow={(row) => {
                        modal.setData(row);
                        modal.setOpen(true);
                    }}
                    data-cy="index-data-table-field-10"
                />
                <FormModal<PartnerSchools>
                    open={modal.open}
                    onClose={() => modal.setOpen(false)}
                    title={
                        isEdit ? 'Edit Partner School' : 'Add Partner School'
                    }
                    mode={isEdit ? 'edit' : 'create'}
                    row={modal.data ?? undefined}
                    fields={fields}
                    submitLabel={isEdit ? 'Update School' : 'Create School'}
                    cancelLabel={'Cancel'}
                    mutationFn={(payload) =>
                        isEdit && modal.data
                            ? partnerSchoolService.update(
                                  modal.data.id,
                                  payload as Partial<PartnerSchools>,
                              )
                            : partnerSchoolService.create(
                                  payload as Partial<PartnerSchools>,
                              )
                    }
                    invalidateKeys={tableListInvalidateKeys(
                        'settings-partner-schools',
                    )}
                    onSuccess={() =>
                        toast({
                            title: isEdit
                                ? 'Partner school updated'
                                : 'Partner school created',
                            variant: 'success',
                        })
                    }
                />
            </SettingsPrimaryLayout>
        </>
    );
}
