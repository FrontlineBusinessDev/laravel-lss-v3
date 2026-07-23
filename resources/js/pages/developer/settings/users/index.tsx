import { userService } from '@/api-service-layer/admin/user';
import { useGlobalModal } from '@/components/global-modal';
import type { RowMenuAction } from '@/components/RowMenu';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions, ColumnDef } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/use-auth';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import type { StatusKind } from '@/types/reusable/status-kind';
import { ROLE_FILTER_PAIRS } from '@/types/reusable/roles';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import { usePage } from '@inertiajs/react';
import {
    KeyRound,
    Pencil,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserRoundX,
} from 'lucide-react';
import type { UserRow } from './UserModal';
import UserModal from './UserModal';

const PERMISSION = 'manage users';

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

const listHeader = (
    <SettingsListHeader
        labels={['Name', 'Email', 'Role', 'Status']}
        data-cy="index-settings-list-header-1"
    />
);

export default function index() {
    const { role } = useAuth();
    const { showToast } = useToast();
    const currentUserId = usePage().props.auth?.user?.id;
    const modal = useGlobalModal<UserRow | null>('settingsUser', null);

    // Admin action: queue the reset/setup email for a user. Archived accounts
    // are blocked server-side, so the menu item is disabled for them below.
    const sendPasswordReset = async (row: UserRow) => {
        try {
            await userService.sendPasswordReset(row.id);
            showToast(`A reset link was sent to ${row.email}.`, 'success');
        } catch (err) {
            showToast(
                err instanceof Error
                    ? err.message
                    : 'Could not send reset email',
                'error',
            );
        }
    };

    const renderRow = (row: UserRow, actions: CardActions) => {
        const isSelf = row.id === currentUserId;
        const isArchived = row.status !== 'active';
        const badge: StatusKind = isArchived ? 'suspended' : 'active';
        const isTrainee = row.role === 'trainee';
        const menu: RowMenuAction[] = [
            isTrainee
                ? null
                : {
                      label: 'Edit user',
                      icon: Pencil,
                      onClick: actions.onEdit,
                      disabled: !actions.canEdit,
                  },
            {
                label: 'Send password reset',
                icon: KeyRound,
                onClick: () => void sendPasswordReset(row),
                disabled: isArchived,
            },
            isArchived
                ? {
                      label: 'Restore',
                      icon: UserCheck,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Suspend',
                      icon: UserRoundX,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive || isSelf,
                  },
            isArchived
                ? {
                      label: 'Delete',
                      icon: Trash2,
                      danger: true,
                      onClick: () => void actions.onDelete(),
                      disabled: !actions.canDelete || isSelf,
                  }
                : null,
        ];

        return (
            <SettingsRow
                isArchived={isArchived}
                badge={
                    <StatusBadge
                        status={badge}
                        data-cy="index-status-badge-3"
                    />
                }
                menu={menu}
                data-cy="index-settings-row-2"
            >
                <div
                    className="flex items-center gap-1.5 font-medium text-ink"
                    data-cy="index-div-4"
                >
                    <span className="truncate" data-cy="index-span-5">
                        {row.name}
                    </span>
                    {isSelf && (
                        <span
                            className="rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700"
                            data-cy="index-span-you"
                        >
                            You
                        </span>
                    )}
                </div>
                <TextCell muted data-cy="index-text-cell-7">
                    {row.email}
                </TextCell>
                <div
                    className="inline-flex items-center gap-1 text-sm text-neutral-600"
                    data-cy="index-div-8"
                >
                    {row.role === 'admin' &&
                        row.email == 'contact@frontlinebusiness.com.ph' && (
                            <ShieldCheck
                                size={12}
                                className="text-brand-500"
                                data-cy="index-shield-check-9"
                            />
                        )}
                    {row.role ? cap(row.role) : '—'}
                </div>
            </SettingsRow>
        );
    };

    return (
        <>
            <SettingsPrimaryLayout
                data-cy="index-settings-primary-layout-10"
                actionNode={
                    <AddRecordButton
                        label="Add user"
                        permission={PERMISSION}
                        onClick={() => {
                            modal.setData(null);
                            modal.setOpen(true);
                        }}
                    />
                }
            >
                <SettingsUsersLayout data-cy="index-settings-users-layout-11">
                    <DataTableCardField<UserRow>
                        apiUrl="/settings/users"
                        apiQueryKey="settings-users"
                        columns={columns}
                        defaultSortBy="first_name"
                        editPermission={PERMISSION}
                        archivePermission={PERMISSION}
                        deletePermission={PERMISSION}
                        listHeader={listHeader}
                        renderCard={renderRow}
                        onEditRow={(row) => {
                            modal.setData(row);
                            modal.setOpen(true);
                        }}
                        data-cy="index-data-table-field-12"
                    />
                    <UserModal
                        open={modal.open}
                        onClose={() => modal.setOpen(false)}
                        row={modal.data}
                        actorRole={role}
                    />
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
