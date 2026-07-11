import {
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableField from '@/components/table';
import type { StatusKind } from '@/types';
import type { AcademicProgram } from '@/types/modules/settings/academic/program';
import { columns, fields } from '@/types/modules/settings/academic/program';

const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Course Name', 'Specialization']}
    />
);

const renderRow = (row: AcademicProgram, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge={<StatusBadge status={badge} />}
            menu={buildRecordMenu(actions, isArchived)}
        >
            <TextCell>{row.name}</TextCell>
            <TextCell>{row.course_name}</TextCell>
            <TextCell>{row.specialization}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    return (
        <>
            <DataTableField<AcademicProgram>
                apiUrl="/settings/academic/program"
                apiQueryKey="settings-academic/program"
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
