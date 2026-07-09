import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, {
    CardActions,
    ColumnDef,
    FieldDef,
} from '@/components/table';
import { useAuth } from '@/hooks/use-auth';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import { cn } from '@/lib/utils';
import { StatusKind } from '@/types';
import { usePage } from '@inertiajs/react';
import { Archive, ArchiveRestore, Pencil, ShieldCheck } from 'lucide-react';

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

const ROLE_FILTER_PAIRS = [
    { value: '', label: 'All Roles' },
    { value: 'developer', label: 'Developer' },
    { value: 'admin', label: 'Admin' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'trainee', label: 'Trainee' },
];
const STATUS_FILTER_PAIRS = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const columns: ColumnDef<UserRow>[] = [
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        filterable: true,
        type: 'select',
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'roles',
        label: 'Role',
        sortable: false,
        filterable: true,
        type: 'select',
        typeData: ROLE_FILTER_PAIRS,
    },
    { key: 'first_name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
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

export default function index() {
    const { role } = useAuth();
    const currentUserId = usePage().props.auth?.user?.id;
    const fields: FieldDef<UserRow>[] = [
        {
            key: 'first_name',
            label: 'First name',
            type: 'text',
            required: true,
            placeholder: 'Juan',
            colSpan: 2,
        },
        {
            key: 'last_name',
            label: 'Last name',
            type: 'text',
            required: true,
            placeholder: 'Dela Cruz',
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
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive || isSelf,
                  },
            // {
            //     label: 'Delete',
            //     icon: Trash2,
            //     danger: true,
            //     onClick: () => void actions.onDelete(),
            //     disabled: !actions.canDelete || isSelf,
            // },
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
                <div className="truncate text-xs text-neutral-500">
                    {row.email}
                </div>
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
        <>
            <SettingsPrimaryLayout>
                <SettingsUsersLayout>
                    <DataTableField<UserRow>
                        apiUrl="/settings/users"
                        apiQueryKey="settings-users"
                        actionsCreateClassName="float-right"
                        columns={columns}
                        fields={fields}
                        enableSuspend={true}
                        createLabel="Add user"
                        modalTitle={(s) =>
                            s.mode === 'create' ? 'Add user' : 'Edit user'
                        }
                        defaultSortBy="first_name"
                        createPermission="manage users"
                        editPermission="manage users"
                        archivePermission="manage users"
                        deletePermission="manage users"
                        listHeader={listHeader}
                        renderCard={renderRow}
                    />
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
