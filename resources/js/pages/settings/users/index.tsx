import { usePage } from '@inertiajs/react';
import { KeyRound, Pencil, ShieldCheck, Trash2, UserCheck, UserRoundX } from 'lucide-react';
import type { RowMenuAction } from '@/components/RowMenu';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions, ColumnDef, FieldDef } from '@/components/table';
import DataTableField from '@/components/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import { apiFetchJson } from '@/lib/apiFetch';
import type { StatusKind } from '@/types';
import { ROLE_FILTER_PAIRS } from '@/types/reusable/roles';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

/** Row shape returned by UserResource. Index signature satisfies DataTableField. */
interface UserRow extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: string | null;
  status: string;
}
const columns: ColumnDef<UserRow>[] = [{
  key: 'status',
  label: 'Status',
  sortable: true,
  filterable: true,
  type: 'select',
  typeData: STATUS_FILTER_PAIRS,
  exactFilters: true
}, {
  key: 'roles',
  label: 'Role',
  sortable: false,
  filterable: true,
  type: 'select',
  typeData: ROLE_FILTER_PAIRS
}, {
  key: 'first_name',
  label: 'Name',
  sortable: true,
  filterable: true
}, {
  key: 'email',
  label: 'Email',
  sortable: true,
  filterable: true
}];
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Creator-scoped role matrix (mirrors UserController::assignableRoles). */
function roleOptions(actorRole: string) {
  const roles = actorRole === 'developer' ? ['developer', 'admin', 'trainer'] : actorRole === 'admin' ? ['admin', 'trainer'] : [];
  return roles.map(r => ({
    value: r,
    label: cap(r)
  }));
}
export default function index() {
  const {
    role
  } = useAuth();
  const {
    toast
  } = useToast();
  const currentUserId = usePage().props.auth?.user?.id;

  // Admin action: queue the reset/setup email for a user (server route
  // POST /settings/users/{id}/reset-password). Archived accounts are blocked
  // server-side, so the menu item is disabled for them below.
  const sendPasswordReset = async (row: UserRow) => {
    try {
      await apiFetchJson(`/settings/users/${row.id}/reset-password`, {
        method: 'POST'
      });
      toast({
        title: 'Password reset email sent',
        description: `A reset link was sent to ${row.email}.`,
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Could not send reset email',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error'
      });
    }
  };
  const fields: FieldDef<UserRow>[] = [{
    key: 'first_name',
    label: 'First name',
    type: 'text',
    required: true,
    placeholder: 'Juan',
    colSpan: 2
  }, {
    key: 'last_name',
    label: 'Last name',
    type: 'text',
    required: true,
    placeholder: 'Dela Cruz',
    colSpan: 2
  }, {
    key: 'email',
    label: 'Email address',
    type: 'email',
    required: true,
    placeholder: 'name@frontlinebusiness.com.ph',
    colSpan: 2,
    disabled: mode => mode === 'edit'
  }, {
    key: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    colSpan: 2,
    options: roleOptions(role),
    defaultValue: roleOptions(role)[0]?.value
  }];
  const listHeader = <SettingsListHeader labels={['Name', 'Email', 'Role', 'Status']} data-cy="index-settings-list-header-1" />;
  const renderRow = (row: UserRow, actions: CardActions) => {
    const isSelf = row.id === currentUserId;
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'suspended' : 'active';
    const menu: RowMenuAction[] = [{
      label: 'Edit user',
      icon: Pencil,
      onClick: actions.onEdit,
      disabled: !actions.canEdit
    }, {
      label: 'Send password reset',
      icon: KeyRound,
      onClick: () => void sendPasswordReset(row),
      disabled: isArchived
    }, isArchived ? {
      label: 'Restore',
      icon: UserCheck,
      onClick: actions.onRestore
    } : {
      label: 'Suspend',
      icon: UserRoundX,
      onClick: actions.onArchive,
      disabled: !actions.canArchive || isSelf
    }, isArchived ? {
      label: 'Delete',
      icon: Trash2,
      danger: true,
      onClick: () => void actions.onDelete(),
      disabled: !actions.canDelete || isSelf
    } : null];
    return <SettingsRow isArchived={isArchived} badge={<StatusBadge status={badge} data-cy="index-status-badge-3" />} menu={menu} data-cy="index-settings-row-2">
                <div className="flex items-center gap-1.5 font-medium text-ink" data-cy="index-div-4">
                    <span className="truncate" data-cy="index-span-5">{row.name}</span>
                    {isSelf && <span className="rounded-pill bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700" data-cy="index-span-you">
                            You
                        </span>}
                </div>
                <TextCell muted data-cy="index-text-cell-7">{row.email}</TextCell>
                <div className="inline-flex items-center gap-1 text-sm text-neutral-600" data-cy="index-div-8">
                    {row.role === 'admin' && <ShieldCheck size={12} className="text-brand-500" data-cy="index-shield-check-9" />}
                    {row.role ? cap(row.role) : '—'}
                </div>
            </SettingsRow>;
  };
  return <>
            <SettingsPrimaryLayout data-cy="index-settings-primary-layout-10">
                <SettingsUsersLayout data-cy="index-settings-users-layout-11">
                    <DataTableField<UserRow> apiUrl="/settings/users" apiQueryKey="settings-users" columns={columns} fields={fields} enableSuspend={true} createLabel="Add user" modalTitle={s => s.mode === 'create' ? 'Add user' : 'Edit user'} defaultSortBy="first_name" createPermission="manage users" editPermission="manage users" archivePermission="manage users" deletePermission="manage users" listHeader={listHeader} renderCard={renderRow} data-cy="index-data-table-field-12" />
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>;
}