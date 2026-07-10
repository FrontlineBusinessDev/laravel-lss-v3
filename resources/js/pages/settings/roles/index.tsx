import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import type { RowMenuAction } from '@/components/RowMenu';
import { SettingsListHeader, SettingsRow } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions, ColumnDef } from '@/components/table';
import DataTableField from '@/components/table';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import type { PermissionModules, RoleRow } from './RoleModal';
import { RoleModal } from './RoleModal';

const ROLE_GRID = 'sm:grid-cols-[2fr_1.4fr_0.9fr_2.5rem]';
const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];

const columns: ColumnDef<RoleRow>[] = [
    { key: 'name', label: 'Role', sortable: true },
    { key: 'permissions_count', label: 'Permissions', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
];

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const listHeader = (
    <SettingsListHeader
        grid={ROLE_GRID}
        labels={['Role', 'Permissions', 'Status']}
    />
);

const renderRow = (row: RoleRow, actions: CardActions) => {
    const isProtected = PROTECTED_ROLES.includes(row.name);
    const menu: RowMenuAction[] = [
        { label: 'Edit role', icon: Pencil, onClick: actions.onEdit },
        {
            label: 'Delete role',
            icon: Trash2,
            danger: true,
            onClick: () => void actions.onDelete(),
            disabled: !actions.canDelete || isProtected,
        },
    ];

    return (
        <SettingsRow
            grid={ROLE_GRID}
            badge={<StatusBadge status="active" />}
            menu={menu}
        >
            <div className="inline-flex items-center gap-1.5 font-medium text-ink">
                {isProtected && (
                    <ShieldCheck size={13} className="text-brand-500" />
                )}
                {cap(row.name)}
            </div>
            <div className="text-sm text-neutral-600">
                {row.permissions_count}{' '}
                {row.permissions_count === 1 ? 'permission' : 'permissions'}
            </div>
        </SettingsRow>
    );
};

export default function index({
    permissionModules,
}: {
    permissionModules: PermissionModules;
}) {
    return (
        <>
            <SettingsPrimaryLayout>
                <SettingsUsersLayout>
                    <DataTableField<RoleRow>
                        apiUrl="/settings/roles"
                        apiQueryKey="settings-roles"
                        columns={columns}
                        createLabel="Add role"
                        modalTitle={(s) =>
                            s.mode === 'create' ? 'Add role' : 'Edit role'
                        }
                        defaultSortBy="name"
                        createPermission="manage roles"
                        editPermission="manage roles"
                        deletePermission="manage roles"
                        listHeader={listHeader}
                        renderCard={renderRow}
                        renderModal={(props) => (
                            <RoleModal
                                {...props}
                                permissionModules={permissionModules}
                            />
                        )}
                    />
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
