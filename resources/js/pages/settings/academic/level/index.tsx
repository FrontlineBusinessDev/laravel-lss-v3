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
import type {
    AcademicLevel} from '@/types/modules/settings/academic/level';
import {
    columns,
    fields,
} from '@/types/modules/settings/academic/level';

const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Year Level', 'Description']}
    />
);

const renderRow = (row: AcademicLevel, actions: CardActions) => {
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
            <TextCell>{row.year_level}</TextCell>
            <TextCell>{row.description}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    return (
        <>
            <DataTableField<AcademicLevel>
                apiUrl="/settings/academic/level"
                apiQueryKey="settings-academic/level"
                actionsCreateClassName="mt-2 sm:mt-0 ml-5"
                columns={columns}
                fields={fields}
                createLabel="Add Level"
                modalTitle={(s) =>
                    s.mode === 'create' ? 'Add Level' : 'Edit Level'
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
