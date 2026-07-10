import {
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableField from '@/components/table';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { StatusKind } from '@/types';
import type {
    PartnerSchools} from '@/types/modules/settings/partner-schools';
import {
    columns,
    fields
} from '@/types/modules/settings/partner-schools';

const customGRID = 'sm:grid-cols-[1fr_1.6fr_2.2fr_1.2fr_0.9fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={[
            'School Name',
            'Abbrevation',
            'Contact Name',
            'Email',
            'Status',
        ]}
    />
);

const renderRow = (row: PartnerSchools, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge={<StatusBadge status={badge} />}
            menu={buildRecordMenu(actions, isArchived)}
        >
            <TextCell>{row.school_name}</TextCell>
            <TextCell>{row.abbreviation}</TextCell>
            <TextCell muted>
                {row.contact_first_name} {row.contact_last_name}
            </TextCell>
            <TextCell muted>{row.contact_email}</TextCell>
        </SettingsRow>
    );
};

export default function index() {
    return (
        <>
            <SettingsPrimaryLayout>
                <DataTableField<PartnerSchools>
                    apiUrl="/settings/partner-schools"
                    apiQueryKey="settings-partner-schools"
                    actionsCreateClassName="float-none ml-5"
                    columns={columns}
                    fields={fields}
                    createLabel="Add Partner School"
                    modalTitle={(s) =>
                        s.mode === 'create'
                            ? 'Add Partner School'
                            : 'Edit Partner School'
                    }
                    defaultSortBy="first_name"
                    createPermission="manage settings partner schools"
                    editPermission="manage settings partner schools"
                    archivePermission="manage settings partner schools"
                    deletePermission="manage settings partner schools"
                    listHeader={listHeader}
                    renderCard={renderRow}
                />
            </SettingsPrimaryLayout>
        </>
    );
}
