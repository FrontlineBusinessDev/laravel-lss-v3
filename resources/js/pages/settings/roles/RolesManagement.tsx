import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { DataTableField } from '@/components/table';
import type { CardActions, ColumnDef } from '@/components/table';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import {
    RoleModal,
    type PermissionModules,
    type RoleRow,
} from './RoleModal';

const GRID = 'sm:grid sm:grid-cols-[2fr_1.4fr_0.9fr_2.5rem] sm:items-center sm:gap-3';
const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];

const columns: ColumnDef<RoleRow>[] = [
    { key: 'name', label: 'Role', sortable: true },
    { key: 'permissions_count', label: 'Permissions', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
];

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const listHeader = (
    <div
        className={cn(
            GRID,
            'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500',
        )}
    >
        <span>Role</span>
        <span>Permissions</span>
        <span>Status</span>
        <span />
    </div>
);

export function RolesManagement({
    permissionModules,
}: {
    permissionModules: PermissionModules;
}) {
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
            <div className={cn('flex flex-col gap-1 px-4 py-3', GRID)}>
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
                <div className="flex items-center justify-between sm:contents">
                    <StatusBadge status="active" />
                    <div className="sm:justify-self-end">
                        <RowMenu actions={menu} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTableField<RoleRow>
            apiUrl="/settings/roles"
            apiQueryKey="settings-roles"
            columns={columns}
            createLabel="Add role"
            modalTitle={(s) => (s.mode === 'create' ? 'Add role' : 'Edit role')}
            defaultSortBy="name"
            createPermission="manage roles"
            editPermission="manage roles"
            deletePermission="manage roles"
            listHeader={listHeader}
            renderCard={renderRow}
            renderModal={(props) => (
                <RoleModal {...props} permissionModules={permissionModules} />
            )}
        />
    );
}
