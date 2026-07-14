import { SettingsListHeader, SettingsRow, TextCell, buildRecordMenu } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableField from '@/components/table';
import { Thumbnail } from '@/components/Thumbnail';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import type { StatusKind } from '@/types';
import type { PartnerSchools } from '@/types/modules/settings/partner-schools';
import { columns, fields } from '@/types/modules/settings/partner-schools';
const customGRID = 'sm:grid-cols-[3rem_1fr_1.6fr_2.2fr_1.2fr_0.9fr_2.5rem]';
const listHeader = <SettingsListHeader grid={customGRID} labels={['Logo', 'School Name', 'Abbreviation', 'Contact Name', 'Email', 'Status']} data-cy="index-settings-list-header-1" />;
const renderRow = (row: PartnerSchools, actions: CardActions) => {
  const isArchived = row.status !== 'active';
  const badge: StatusKind = isArchived ? 'archived' : 'active';
  return <SettingsRow grid={customGRID} isArchived={isArchived} badge={<StatusBadge status={badge} data-cy="index-status-badge-3" />} menu={buildRecordMenu(actions, isArchived)}
  // classNameParent="flex-row items-center gap-4"
  data-cy="index-settings-row-2">
            <Thumbnail src={row.image} alt={`${row.school_name} logo`} className="h-10 w-10 rounded-lg border border-slate-200 object-cover" data-cy="index-thumbnail-4" />
            <TextCell data-cy="index-text-cell-5"> {row.school_name}</TextCell>
            <TextCell data-cy="index-text-cell-6">{row.abbreviation}</TextCell>
            <TextCell muted data-cy="index-text-cell-7">
                {row.contact_first_name} {row.contact_last_name}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-8">{row.contact_email}</TextCell>
        </SettingsRow>;
};
export default function index() {
  return <>
            <SettingsPrimaryLayout data-cy="index-settings-primary-layout-9">
                <DataTableField<PartnerSchools> apiUrl="/settings/partner-schools" apiQueryKey="settings-partner-schools" columns={columns} fields={fields} createLabel="Add Partner School" modalTitle={s => s.mode === 'create' ? 'Add Partner School' : 'Edit Partner School'} defaultSortBy="first_name" createPermission="manage settings partner schools" editPermission="manage settings partner schools" archivePermission="manage settings partner schools" deletePermission="manage settings partner schools" listHeader={listHeader} renderCard={renderRow} data-cy="index-data-table-field-10" />
            </SettingsPrimaryLayout>
        </>;
}