import { usePage } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Pencil,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { DataTableField } from '@/components/table';
import type { CardActions, ColumnDef, FieldDef } from '@/components/table';
import { Dropdown } from '@/components/Dropdown';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types';

/** Row shape returned by UserResource. Index signature satisfies DataTableField. */
interface UserRow extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    role: string | null;
    status: string;
}

const GRID =
    'sm:grid sm:grid-cols-[1.6fr_2.2fr_1.2fr_0.9fr_2.5rem] sm:items-center sm:gap-3';

const ROLE_FILTERS = ['All roles', 'Developer', 'Admin', 'Trainer', 'Trainee'];
const STATUS_FILTERS = ['All statuses', 'Active', 'Archive'];

const columns: ColumnDef<UserRow>[] = [
    { key: 'first_name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
];

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Creator-scoped role matrix (mirrors UserController::assignableRoles). */
function roleOptions(actorRole: string) {
    const roles =
        actorRole === 'developer'
            ? ['developer', 'admin', 'trainer']
            : actorRole === 'admin'
              ? ['admin', 'trainer']
              : [];

    return roles.map((r) => ({ value: r, label: cap(r) }));
}

export function UsersManagement() {
    const { role } = useAuth();
    const currentUserId = usePage().props.auth?.user?.id;
    const [roleFilter, setRoleFilter] = useState('All roles');
    const [statusFilter, setStatusFilter] = useState('All statuses');

    const fields: FieldDef<UserRow>[] = [
        {
            key: 'name',
            label: 'Full name',
            type: 'text',
            required: true,
            placeholder: 'Juan Dela Cruz',
            colSpan: 2,
        },
        {
            key: 'email',
            label: 'Email address',
            type: 'email',
            required: true,
            placeholder: 'name@frontlinebusiness.com.ph',
            colSpan: 2,
            disabled: (mode) => mode === 'edit',
        },
        {
            key: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            colSpan: 2,
            options: roleOptions(role),
            defaultValue: roleOptions(role)[0]?.value,
        },
    ];

    const extraFilters: Record<string, unknown> = {
        ...(roleFilter !== 'All roles' ? { role: roleFilter.toLowerCase() } : {}),
        ...(statusFilter !== 'All statuses'
            ? { status: statusFilter === 'Active' ? 'active' : 'inactive' }
            : {}),
    };

    const filterControls = (
        <>
            <div className="w-full sm:w-44">
                <Dropdown
                    options={ROLE_FILTERS}
                    value={roleFilter}
                    onChange={setRoleFilter}
                />
            </div>
            <div className="w-full sm:w-40">
                <Dropdown
                    options={STATUS_FILTERS}
                    value={statusFilter}
                    onChange={setStatusFilter}
                />
            </div>
        </>
    );

    const listHeader = (
        <div
            className={cn(
                GRID,
                'hidden bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-500',
            )}
        >
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span />
        </div>
    );

    const renderRow = (row: UserRow, actions: CardActions) => {
        const isSelf = row.id === currentUserId;
        const isArchived = row.status !== 'active';
        const badge: StatusKind = isArchived ? 'archived' : 'active';
        const menu: RowMenuAction[] = [
            {
                label: 'Edit user',
                icon: Pencil,
                onClick: actions.onEdit,
                disabled: !actions.canEdit,
            },
            isArchived
                ? { label: 'Restore', icon: ArchiveRestore, onClick: actions.onRestore }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive || isSelf,
                  },
            {
                label: 'Delete',
                icon: Trash2,
                danger: true,
                onClick: () => void actions.onDelete(),
                disabled: !actions.canDelete || isSelf,
            },
        ];

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    GRID,
                    isArchived && 'opacity-60',
                )}
            >
                <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span className="truncate">{row.name}</span>
                    {isSelf && (
                        <span className="rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                            You
                        </span>
                    )}
                </div>
                <div className="truncate text-xs text-neutral-500">{row.email}</div>
                <div className="inline-flex items-center gap-1 text-sm text-neutral-600">
                    {row.role === 'admin' && (
                        <ShieldCheck size={12} className="text-brand-500" />
                    )}
                    {row.role ? cap(row.role) : '—'}
                </div>
                <div className="flex items-center justify-between sm:contents">
                    <StatusBadge status={badge} />
                    <div className="sm:justify-self-end">
                        <RowMenu actions={menu} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTableField<UserRow>
            apiUrl="/settings/users"
            apiQueryKey="settings-users"
            columns={columns}
            fields={fields}
            createLabel="Add user"
            modalTitle={(s) => (s.mode === 'create' ? 'Add user' : 'Edit user')}
            defaultSortBy="first_name"
            createPermission="manage users"
            editPermission="manage users"
            archivePermission="manage users"
            deletePermission="manage users"
            extraFilters={extraFilters}
            filterControls={filterControls}
            listHeader={listHeader}
            renderCard={renderRow}
        />
    );
}
