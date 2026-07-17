import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { roleService } from '@/api-service-layer/admin/role';
import type { RoleInput } from '@/api-service-layer/admin/role';
import { useGlobalModal } from '@/components/global-modal';
import type { RowMenuAction } from '@/components/RowMenu';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions, ColumnDef } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import SettingsPrimaryLayout from '@/layouts/settings/SettingsPrimaryLayout';
import SettingsUsersLayout from '@/layouts/settings/SettingsUsersLayout';
import type { StatusKind } from '@/types';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import type { PermissionModules, RoleRow } from './RoleModal';
import { RoleModal } from './RoleModal';

const PERMISSION = 'manage roles';
const ROLE_GRID = 'sm:grid-cols-[2fr_1.4fr_0.9fr_2.5rem]';
const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];

const columns: ColumnDef<RoleRow>[] = [
    {
        key: 'status',
        label: 'Status',
        sortable: false,
        filterable: true,
        type: 'select',
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    { key: 'name', label: 'Role', sortable: true, filterable: true },
    { key: 'permissions_count', label: 'Permissions', sortable: false },
];

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const listHeader = (
    <SettingsListHeader
        grid={ROLE_GRID}
        labels={['Role', 'Permissions', 'Status']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: RoleRow, actions: CardActions) => {
    const isProtected = PROTECTED_ROLES.includes(row.name);
    const badge: StatusKind = row.status === 'active' ? 'active' : 'archived';
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
            badge={
                <StatusBadge status={badge} data-cy="index-status-badge-3" />
            }
            menu={menu}
            data-cy="index-settings-row-2"
        >
            <div
                className="inline-flex items-center gap-1.5 font-medium text-ink"
                data-cy="index-div-4"
            >
                {isProtected && (
                    <ShieldCheck
                        size={13}
                        className="text-brand-500"
                        data-cy="index-shield-check-5"
                    />
                )}
                {cap(row.name)}
            </div>
            <div className="text-sm text-neutral-600" data-cy="index-div-6">
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
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const modal = useGlobalModal<RoleRow | null>('settingsRole', null);
    const [error, setError] = useState<string | null>(null);
    const isEdit = modal.data !== null;

    const openCreate = () => {
        setError(null);
        modal.setData(null);
        modal.setOpen(true);
    };
    const closeModal = () => {
        setError(null);
        modal.setOpen(false);
    };

    // RoleModal owns its own field state, so it can't ride on FormModal. Wire a
    // mutation directly (mirroring FormModal's success → invalidate → toast →
    // close, error → keep open with inline message) instead.
    const mutation = useMutation<RoleRow, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            (isEdit && modal.data
                ? roleService.update(modal.data.id, payload as RoleInput)
                : roleService.create(payload as RoleInput)) as Promise<RoleRow>,
        onSuccess: () => {
            tableListInvalidateKeys('settings-roles').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            toast({
                title: isEdit ? 'Role updated' : 'Role created',
                variant: 'success',
            });
            closeModal();
        },
    });

    const handleSubmit = async (values: Record<string, unknown>) => {
        setError(null);

        try {
            await mutation.mutateAsync(values);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to save role.',
            );
        }
    };

    return (
        <>
            <SettingsPrimaryLayout
                data-cy="index-settings-primary-layout-7"
                actionNode={
                    <AddRecordButton
                        label="Add role"
                        permission={PERMISSION}
                        onClick={openCreate}
                    />
                }
            >
                <SettingsUsersLayout data-cy="index-settings-users-layout-8">
                    <DataTableCardField<RoleRow>
                        apiUrl="/settings/roles"
                        apiQueryKey="settings-roles"
                        columns={columns}
                        defaultSortBy="name"
                        editPermission={PERMISSION}
                        deletePermission={PERMISSION}
                        listHeader={listHeader}
                        renderCard={renderRow}
                        onEditRow={(row) => {
                            setError(null);
                            modal.setData(row);
                            modal.setOpen(true);
                        }}
                        data-cy="index-data-table-field-9"
                    />
                    {modal.open && (
                        <RoleModal
                            mode={isEdit ? 'edit' : 'create'}
                            row={modal.data ?? undefined}
                            title={isEdit ? 'Edit role' : 'Add role'}
                            isLoading={mutation.isPending}
                            error={error}
                            onClose={closeModal}
                            onSubmit={handleSubmit}
                            permissionModules={permissionModules}
                        />
                    )}
                </SettingsUsersLayout>
            </SettingsPrimaryLayout>
        </>
    );
}
