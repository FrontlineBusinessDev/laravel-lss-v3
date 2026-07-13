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
import type { AcademicIndustry } from '@/types/modules/settings/academic/industry';
import { columns, fields } from '@/types/modules/settings/academic/industry';

const customGRID = 'sm:grid-cols-[1.6fr_2.2fr_1fr_2.5rem]';

const listHeader = (
    <SettingsListHeader grid={customGRID} labels={['Name', 'Description']} />
);

const renderRow = (row: AcademicIndustry, actions: CardActions) => {
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
            <TextCell>{row.description}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    return (
        <>
            <DataTableField<AcademicIndustry>
                apiUrl="/settings/academic/industry"
                apiQueryKey="settings-academic/industry"
                columns={columns}
                fields={fields}
                createLabel="Add Industry"
                modalTitle={(s) =>
                    s.mode === 'create' ? 'Add Industry' : 'Edit Industry'
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
