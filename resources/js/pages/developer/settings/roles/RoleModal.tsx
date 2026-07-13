import { useState } from 'react';
import { Button } from '@/components/Button';
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

        await onSubmit({ name: name.trim(), permissions: selected });
    }

    return (
        <Modal open onClose={onClose} title={title} maxWidth={560}>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
                Role name
            </label>
            <input
                type="text"
                value={name}
                disabled={isProtectedName}
                placeholder="e.g. Program coordinator"
                onChange={(e) => {
                    setName(e.target.value);
                    setNameError(null);
                }}
                className="mb-1 h-9 w-full rounded-md border border-neutral-200 px-3 text-sm shadow-card transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-neutral-50 disabled:text-neutral-400"
            />
            {isProtectedName && (
                <p className="mb-3 text-[11px] text-neutral-400">
                    Core role names are fixed; you can still adjust their
                    permissions.
                </p>
            )}
            {nameError && (
                <p className="mb-3 text-xs font-medium text-danger-600">
                    {nameError}
                </p>
            )}

            <div className="mt-3 max-h-[46vh] space-y-4 overflow-y-auto lss-scrollbar pr-1">
                {Object.entries(permissionModules).map(([group, perms]) => {
                    const allChecked = perms.every((p) => selected.includes(p));

                    return (
                        <div
                            key={group}
                            className="rounded-lg border border-neutral-200 p-3"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold text-ink">
                                    {group}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(perms, allChecked)}
                                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                                >
                                    {allChecked ? 'Clear all' : 'Select all'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                {perms.map((permission) => (
                                    <label
                                        key={permission}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-neutral-50',
                                            selected.includes(permission)
                                                ? 'text-ink'
                                                : 'text-neutral-600',
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(permission)}
                                            onChange={() => toggle(permission)}
                                            className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-600 focus:ring-brand-200"
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
                <p className="mt-3 text-xs font-medium text-danger-600">{error}</p>
            )}

            <div className="mt-5 flex gap-2">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {mode === 'create' ? 'Create role' : 'Save changes'}
                </Button>
            </div>
        </Modal>
    );
}
