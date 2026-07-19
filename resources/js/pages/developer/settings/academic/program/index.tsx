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
import SettingsAcademicLayout from '@/layouts/settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { StatusKind } from '@/types';
import type { AcademicProgram } from '@/types/modules/settings/academic/program';
import { columns } from '@/types/modules/settings/academic/program';
import AcademicProgramModal from './AcademicProgramModal';

const PERMISSION = 'manage settings academic';
const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Course Name', 'Specialization']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AcademicProgram, actions: CardActions) => {
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
            <TextCell data-cy="index-text-cell-5">{row.course_name}</TextCell>
            <TextCell data-cy="index-text-cell-6">
                {row.specialization}
            </TextCell>
        </SettingsRow>
    );
};

export default function index() {
    const modal = useGlobalModal<AcademicProgram | null>(
        'academicProgram',
        null,
    );

    return (
        <>
            <SettingsPrimaryLayout
                actionNode={
                    <AddRecordButton
                        label="Add Program"
                        permission={PERMISSION}
                        onClick={() => {
                            modal.setData(null);
                            modal.setOpen(true);
                        }}
                    />
                }
            >
                <SettingsAcademicLayout>
                    <DataTableCardField<AcademicProgram>
                        apiUrl="/settings/academic/program"
                        apiQueryKey="settings-academic/program"
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
                    <AcademicProgramModal
                        open={modal.open}
                        onClose={() => modal.setOpen(false)}
                        row={modal.data}
                    />
                </SettingsAcademicLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
