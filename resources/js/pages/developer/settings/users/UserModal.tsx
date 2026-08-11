import { userService } from '@/api-service-layer/admin/user';
import type { UserInput } from '@/api-service-layer/admin/user';
import { assignableRoles } from '@/api-service-layer/roles';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import type { FieldDef } from '@/components/table';
import { useToast } from '@/components/Toast';

/** Row shape returned by UserResource. Index signature satisfies DataTableField. */
export interface UserRow extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    roles: string[];
    status: string;
}

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Creator-scoped role options for the multi-select, sourced from the single shared matrix in api-service-layer/roles.ts (mirrors UserController::assignableRoles). */
function roleOptions(actorRole: string) {
    return assignableRoles(actorRole).map((r) => ({ value: r, label: cap(r) }));
}

interface Props {
    open: boolean;
    onClose: () => void;
    row: UserRow | null;
    actorRole: string;
}

export default function UserModal({ open, onClose, row, actorRole }: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;

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
            key: 'roles',
            label: 'Roles',
            type: 'multi-select',
            required: true,
            colSpan: 2,
            options: roleOptions(actorRole),
            defaultValue: [],
        },
    ];

    return (
        <FormModal<UserRow>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit user' : 'Add user'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Save changes' : 'Create'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                (isEdit && row
                    ? userService.update(row.id, payload as UserInput)
                    : userService.create(
                          payload as UserInput,
                      )) as Promise<UserRow>
            }
            invalidateKeys={tableListInvalidateKeys('settings-users')}
            onSuccess={() =>
                showToast(isEdit ? 'User updated' : 'User created', 'success')
            }
        />
    );
}
