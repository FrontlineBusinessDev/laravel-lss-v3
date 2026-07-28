import { useGlobalModal } from '@/components/global-modal';
import {
    AddRecordButton,
    buildRecordMenu,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { CardActions } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import SettingsAcademicLayout from '@/layouts/settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import {
    AcademicProgramType,
    columns,
} from '@/types/modules/settings/academic/program-type';
import { StatusKind } from '@/types/reusable/status-kind';
import AcademicProgramTypeTypeModal from './AcademicProgramTypeModal';

const PERMISSION = 'manage settings academic';
const customGRID = 'sm:grid-cols-[2fr_1fr_1fr_1fr]!';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Abbreviation']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AcademicProgramType, actions: CardActions) => {
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
        </SettingsRow>
    );
};

export default function index() {
    const modal = useGlobalModal<AcademicProgramType | null>(
        'academicProgramType',
        null,
    );

    return (
        <>
            <SettingsPrimaryLayout
                actionNode={
                    <AddRecordButton
                        label="Add Program Type"
                        permission={PERMISSION}
                        onClick={() => {
                            modal.setData(null);
                            modal.setOpen(true);
                        }}
                    />
                }
            >
                <SettingsAcademicLayout>
                    <DataTableCardField<AcademicProgramType>
                        apiUrl="/settings/academic/program-type"
                        apiQueryKey="settings-academic/program-type"
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
                    <AcademicProgramTypeTypeModal
                        open={modal.open}
                        onClose={() => modal.setOpen(false)}
                        row={modal.data}
                    />
                </SettingsAcademicLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
