import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import type { RowMenuAction } from '@/components/RowMenu';
import { SettingsListHeader, SettingsRow } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions, ColumnDef } from '@/components/table';
import DataTableField from '@/components/table';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import type { StatusKind } from '@/types';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import type { PermissionModules, RoleRow } from './RoleModal';
import { RoleModal } from './RoleModal';
const ROLE_GRID = 'sm:grid-cols-[2fr_1.4fr_0.9fr_2.5rem]';
const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];
const columns: ColumnDef<RoleRow>[] = [{
  key: 'status',
  label: 'Status',
  sortable: false,
  filterable: true,
  type: 'select',
  typeData: STATUS_FILTER_PAIRS,
  exactFilters: true
}, {
  key: 'name',
  label: 'Role',
  sortable: true,
  filterable: true
}, {
  key: 'permissions_count',
  label: 'Permissions',
  sortable: false
}];
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const listHeader = <SettingsListHeader grid={ROLE_GRID} labels={['Role', 'Permissions', 'Status']} data-cy="index-settings-list-header-1" />;
const renderRow = (row: RoleRow, actions: CardActions) => {
  const isProtected = PROTECTED_ROLES.includes(row.name);
  const badge: StatusKind = row.status === 'active' ? 'active' : 'archived';
  const menu: RowMenuAction[] = [{
    label: 'Edit role',
    icon: Pencil,
    onClick: actions.onEdit
  }, {
    label: 'Delete role',
    icon: Trash2,
    danger: true,
    onClick: () => void actions.onDelete(),
    disabled: !actions.canDelete || isProtected
  }];
  return <SettingsRow grid={ROLE_GRID} badge={<StatusBadge status={badge} data-cy="index-status-badge-3" />} menu={menu} data-cy="index-settings-row-2">
            <div className="inline-flex items-center gap-1.5 font-medium text-ink" data-cy="index-div-4">
                {isProtected && <ShieldCheck size={13} className="text-brand-500" data-cy="index-shield-check-5" />}
                {cap(row.name)}
            </div>
            <div className="text-sm text-neutral-600" data-cy="index-div-6">
                {row.permissions_count}{' '}
                {row.permissions_count === 1 ? 'permission' : 'permissions'}
            </div>
        </SettingsRow>;
};
export default function index({
  permissionModules
}: {
  permissionModules: PermissionModules;
}) {
  return <>
            <SettingsPrimaryLayout data-cy="index-settings-primary-layout-7">
                <SettingsUsersLayout data-cy="index-settings-users-layout-8">
                    <DataTableField<RoleRow> apiUrl="/settings/roles" apiQueryKey="settings-roles" columns={columns} createLabel="Add role" modalTitle={s => s.mode === 'create' ? 'Add role' : 'Edit role'} defaultSortBy="name" createPermission="manage roles" editPermission="manage roles" deletePermission="manage roles" listHeader={listHeader} renderCard={renderRow} renderModal={props => <RoleModal {...props} permissionModules={permissionModules} data-cy="index-role-modal-10" />} data-cy="index-data-table-field-9" />
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>;
}