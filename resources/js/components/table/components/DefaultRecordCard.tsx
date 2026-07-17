/**
 * @file components/table/components/DefaultRecordCard.tsx
 * The built-in card used by <DataTableCardField> when no custom `renderCard`
 * (or `children`) is supplied. Presentational only — all actions are passed in.
 * Extracted verbatim from DataTableCardField to keep the orchestrator lean;
 * markup/styling is unchanged.
 */

import { Archive, ArchiveRestore, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@/types/reusable/data-table';
import { formatCell } from '../utils';

interface DefaultRecordCardProps<T> {
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

export function DefaultRecordCard<T extends Record<string, unknown>>({
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
}: DefaultRecordCardProps<T>) {
    const [titleCol, ...rest] = columns;
    const isActive = (row as Record<string, unknown>).status === 'active';

    return (
        <div className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">
                    {formatCell(row[titleCol?.key])}
                </h3>
                <dl className="mt-1 space-y-0.5">
                    {rest.map((col) => {
                        const value = col.render
                            ? col.render(row[col.key], row)
                            : formatCell(row[col.key]);

                        if (value === '—' || value === '' || value == null) {
                            return null;
                        }

                        return (
                            <dd key={col.key} className="truncate text-sm">
                                {value}
                            </dd>
                        );
                    })}
                </dl>
            </div>
            <div className="flex shrink-0 items-center gap-3 pt-0.5">
                {isActive ? (
                    <>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={onEdit}
                                title="Edit"
                                className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                            >
                                <Pencil
                                    className="size-4.5"
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
                                className="rounded-md p-1.5 transition-colors hover:bg-slate-100 hover:dark:bg-slate-100/30"
                            >
                                {archiving ? (
                                    <Loader2 className="size-4.5 animate-spin" />
                                ) : (
                                    <Archive
                                        className="size-4.5"
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
                                <Loader2 className="size-4.5 animate-spin" />
                            ) : (
                                <ArchiveRestore
                                    className="size-4.5"
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
                                    className="size-4.5"
                                    strokeWidth={1.75}
                                />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default DefaultRecordCard;
