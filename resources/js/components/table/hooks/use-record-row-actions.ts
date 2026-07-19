/**
 * @file components/table/hooks/use-record-row-actions.ts
 * Archive / restore / delete row actions (+ in-use guard and delete
 * confirmation state) for <DataTableCardField>. Split out of the controller to
 * keep each file focused; behavior is a 1:1 relocation.
 */

import { useState } from 'react';
import type { InUseEntry } from '@/components/modal/ConfirmInUseModal';
import { useAsyncAction } from '@/hooks/use-async-action';
import { apiFetch } from '@/lib/apiFetch';
import { parseApiError } from '@/lib/parseApiError';
import { buildArchiveUrl, buildDeleteUrl, buildRestoreUrl, getRowId } from '../utils';

type ToastVariant = 'success' | 'error' | 'info';
type ShowToast = (message: string, variant?: ToastVariant) => void;

interface RowActionMutations {
    restore: (id: string) => Promise<unknown>;
    archive: (id: string) => Promise<unknown>;
}

interface RowActionsConfig<T> {
    apiUrl: string;
    restoreUrl?: (row: T) => string;
    archiveUrl?: (row: T) => string;
    deleteUrl?: (row: T) => string;
    onRestore?: (row: T, url: string) => Promise<void>;
    onArchive?: (row: T, url: string) => Promise<void>;
    onDelete?: (row: T, url: string) => Promise<void> | void;
    inUseCheck?: (row: T, action: string) => Promise<InUseEntry[]>;
    mutations: RowActionMutations;
    invalidateTable: () => void;
    showToast: ShowToast;
}

export function useRecordRowActions<T extends Record<string, unknown>>({
    apiUrl,
    restoreUrl,
    archiveUrl,
    deleteUrl,
    onRestore,
    onArchive,
    onDelete,
    inUseCheck,
    mutations,
    invalidateTable,
    showToast,
}: RowActionsConfig<T>) {
    const [inUseTarget, setInUseTarget] = useState<T | null>(null);
    const [inUseEntries, setInUseEntries] = useState<InUseEntry[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleRestore = async (row: T) => {
        try {
            if (onRestore) {
await onRestore(row, buildRestoreUrl(row, apiUrl, restoreUrl));
} else {
await mutations.restore(String(getRowId(row)));
}

            invalidateTable();
            showToast('Restored', 'info');
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Failed to restore.',
                'error',
            );
        }
    };
    const handleArchive = async (row: T) => {
        try {
            if (onArchive) {
await onArchive(row, buildArchiveUrl(row, apiUrl, archiveUrl));
} else {
await mutations.archive(String(getRowId(row)));
}

            invalidateTable();
            showToast('Archived', 'info');
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Failed to archive.',
                'error',
            );
        }
    };

    const { run: runRestore, loading: restoring } =
        useAsyncAction(handleRestore);
    const { run: runArchive, loading: archiving } =
        useAsyncAction(handleArchive);

    const requestDelete = async (row: T) => {
        if (inUseCheck) {
            const entries = await inUseCheck(row, 'delete');

            if (entries.some((e) => e.count > 0)) {
                setInUseEntries(entries);
                setInUseTarget(row);

                return;
            }
        }

        setDeleteTarget(row);
    };
    const confirmDelete = async () => {
        if (!deleteTarget) {
return;
}

        setDeleting(true);

        try {
            const res = await apiFetch(
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
                { method: 'DELETE' },
            );

            if (!res.ok) {
                const apiError = await parseApiError(res);

                if (apiError.inUse && apiError.inUse.some((e) => e.count > 0)) {
                    setInUseEntries(apiError.inUse);
                    setInUseTarget(deleteTarget);
                    setDeleteTarget(null);

                    return;
                }

                showToast(apiError.message, 'error');

                return;
            }

            await onDelete?.(
                deleteTarget,
                buildDeleteUrl(deleteTarget, apiUrl, deleteUrl),
            );
            invalidateTable();
            showToast('Deleted', 'info');
            setDeleteTarget(null);
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Failed to delete.',
                'error',
            );
        } finally {
            setDeleting(false);
        }
    };

    return {
        runRestore,
        restoring,
        runArchive,
        archiving,
        requestDelete,
        confirmDelete,
        deleting,
        deleteTarget,
        setDeleteTarget,
        inUseTarget,
        inUseEntries,
        clearInUse: () => {
            setInUseTarget(null);
            setInUseEntries([]);
        },
    };
}
