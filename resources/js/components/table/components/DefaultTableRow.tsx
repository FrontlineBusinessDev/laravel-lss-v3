/**
 * @file components/table/components/DefaultTableRow.tsx
 * The built-in <tr> used by <DataTable> when no custom `rowActions` renderer
 * is supplied. One <td> per column plus a trailing actions cell — the table
 * analogue of DefaultRecordCard.
 */

import { Archive, ArchiveRestore, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@/types/reusable/data-table';
import { formatCell } from '../utils';

interface DefaultTableRowProps<T> {
    row: T;
    columns: ColumnDef<T>[];
    canEdit: boolean;
    canArchive: boolean;
    canDelete: boolean;
    restoring: boolean;
    archiving: boolean;
    onEdit: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void;
}

export function DefaultTableRow<T extends Record<string, unknown>>({
    row,
    columns,
    canEdit,
    canArchive,
    canDelete,
    restoring,
    archiving,
    onEdit,
    onArchive,
    onRestore,
    onDelete,
}: DefaultTableRowProps<T>) {
    const isActive = (row as Record<string, unknown>).status === 'active';

    return (
        <tr className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                        ? col.render(row[col.key], row)
                        : formatCell(row[col.key])}
                </td>
            ))}
            <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                    {isActive ? (
                        <>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={onEdit}
                                    title="Edit"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100"
                                >
                                    <Pencil
                                        className="size-4"
                                        strokeWidth={1.75}
                                    />
                                </button>
                            )}
                            {canArchive && (
                                <button
                                    type="button"
                                    onClick={onArchive}
                                    disabled={archiving}
                                    title="Archive"
                                    className="rounded-md p-1.5 transition-colors hover:bg-slate-100"
                                >
                                    {archiving ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Archive
                                            className="size-4"
                                            strokeWidth={1.75}
                                        />
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={onRestore}
                                disabled={restoring}
                                title="Restore"
                                className="rounded-md p-1.5 transition-colors hover:bg-yellow-100 hover:text-yellow-700"
                            >
                                {restoring ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ArchiveRestore
                                        className="size-4"
                                        strokeWidth={1.75}
                                    />
                                )}
                            </button>
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    title="Delete"
                                    className="rounded-md p-1.5 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                >
                                    <Trash2
                                        className="size-4"
                                        strokeWidth={1.75}
                                    />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default DefaultTableRow;
