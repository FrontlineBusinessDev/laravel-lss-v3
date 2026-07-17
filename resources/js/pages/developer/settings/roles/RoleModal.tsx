import { useState } from 'react';
import { Button } from '@/components/Button';
import { Field, inputCls } from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { cn } from '@/lib/utils';
export type PermissionModules = Record<string, string[]>;
export interface RoleRow extends Record<string, unknown> {
    id: number;
    name: string;
    permissions: string[];
    permissions_count: number;
    status: string;
}
const PROTECTED_ROLES = ['developer', 'admin', 'trainer', 'trainee'];
interface RoleModalProps {
    mode: 'create' | 'edit';
    row?: RoleRow;
    title: string;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    permissionModules: PermissionModules;
}
const prettify = (permission: string) =>
    permission.charAt(0).toUpperCase() + permission.slice(1);
export function RoleModal({
    mode,
    row,
    title,
    isLoading,
    error,
    onClose,
    onSubmit,
    permissionModules,
}: RoleModalProps) {
    const [name, setName] = useState(row?.name ?? '');
    const [selected, setSelected] = useState<string[]>(row?.permissions ?? []);
    const [nameError, setNameError] = useState<string | null>(null);
    const isProtectedName = PROTECTED_ROLES.includes(row?.name ?? '');
    const toggle = (permission: string) =>
        setSelected((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission],
        );
    const toggleGroup = (perms: string[], allChecked: boolean) =>
        setSelected((prev) =>
            allChecked
                ? prev.filter((p) => !perms.includes(p))
                : Array.from(new Set([...prev, ...perms])),
        );
    async function handleSubmit() {
        if (!name.trim()) {
            setNameError('Role name is required.');
            return;
        }
        await onSubmit({
            name: name.trim(),
            permissions: selected,
        });
    }
    return (
        <Modal
            open
            onClose={onClose}
            title={title}
            maxWidth={560}
            data-cy="role-modal-modal-title"
        >
            <Field
                label="Role name"
                required
                error={nameError ?? undefined}
                data-cy="role-modal-field-role-name"
            >
                <input
                    type="text"
                    value={name}
                    disabled={isProtectedName}
                    placeholder="e.g. Program coordinator"
                    onChange={(e) => {
                        setName(e.target.value);
                        setNameError(null);
                    }}
                    className={inputCls}
                    data-cy="role-modal-input-e-g-program-coordinator"
                />
            </Field>
            {isProtectedName && (
                <p
                    className="mt-1 text-[11px] text-neutral-400"
                    data-cy="role-modal-p-core-role-names-are-fixed-you"
                >
                    Core role names are fixed; you can still adjust their
                    permissions.
                </p>
            )}

            <div
                className="lss-scrollbar mt-3 max-h-[46vh] space-y-4 overflow-y-auto pr-1"
                data-cy="role-modal-div-6"
            >
                {Object.entries(permissionModules).map(([group, perms]) => {
                    const allChecked = perms.every((p) => selected.includes(p));
                    return (
                        <div
                            key={group}
                            className="rounded-lg border border-neutral-200 p-3"
                            data-cy="role-modal-div-7"
                        >
                            <div
                                className="mb-2 flex items-center justify-between"
                                data-cy="role-modal-div-8"
                            >
                                <span
                                    className="text-xs font-semibold text-ink"
                                    data-cy="role-modal-span-9"
                                >
                                    {group}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleGroup(perms, allChecked)
                                    }
                                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                                    data-cy="role-modal-button-button"
                                >
                                    {allChecked ? 'Clear all' : 'Select all'}
                                </button>
                            </div>
                            <div
                                className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
                                data-cy="role-modal-div-11"
                            >
                                {perms.map((permission) => (
                                    <label
                                        key={permission}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-neutral-50',
                                            selected.includes(permission)
                                                ? 'text-ink'
                                                : 'text-neutral-600',
                                        )}
                                        data-cy="role-modal-label-12"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(
                                                permission,
                                            )}
                                            onChange={() => toggle(permission)}
                                            className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-600 focus:ring-brand-200"
                                            data-cy="role-modal-input-checkbox"
                                        />
                                        {prettify(permission)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <p
                    className="mt-3 text-xs font-medium text-danger-600"
                    data-cy="role-modal-p-14"
                >
                    {error}
                </p>
            )}

            <div className="mt-5 flex gap-2" data-cy="role-modal-div-15">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                    data-cy="role-modal-button-close"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    data-cy="role-modal-button-submit"
                >
                    {mode === 'create' ? 'Create role' : 'Save changes'}
                </Button>
            </div>
        </Modal>
    );
}
