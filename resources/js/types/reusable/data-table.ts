/**
 * @file types/reusable/data-table.ts
 * The full prop surface + supporting contracts for <DataTableField>.
 */

import type { ReactNode } from 'react';
import type { CardActions } from '@/types/reusable/card';
import type { FieldDef, ModalMode } from '@/types/reusable/fields';
import type { PaginationMeta } from '@/types/reusable/pagination';
export type { PaginationMeta };

export const GRID =
    'sm:grid sm:grid-cols-[1.6fr_2.2fr_1.2fr_0.9fr_2.5rem] sm:items-center sm:gap-3';

export interface ColumnDef<T = object> {
    key: string;
    label: string;
    filterable?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    width?: string;
    type?: string;
    typeData?: string[] | Record<string, unknown>[];
    exactFilters?: boolean;
    // | { label: string; value: unknown }[];
    render?: (value: unknown, row: T) => ReactNode;
}

/** A single segment of the status filter segmented control. */
export interface StatusFilterTab {
    value: string;
    label: string;
}

/** Create/edit modal state owned by DataTableField. */
export interface ModalState<T> {
    mode: ModalMode;
    row?: T;
}

/** Props handed to a caller-supplied `renderModal`. */
export interface RenderModalProps<T> {
    mode: ModalMode;
    row?: T;
    title: string;
    isLoading: boolean;
    error: string | null;
    /** Real upload progress (0–100) while a file is being sent, else null. */
    uploadProgress?: number | null;
    onClose: () => void;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

/** One blocking relation reported by the backend in-use guard. */
export interface InUseEntry {
    label: string;
    count: number;
}

export interface DataTableProps<T> {
    apiUrl: string;
    /** TanStack Query cache key for this resource. */
    apiQueryKey: string | string[];
    columns: ColumnDef<T>[];
    fields?: FieldDef<T>[];
    title?: string;
    description?: string;
    actions?: ReactNode;
    actionsCreateClassName?: string;
    renderCard?: (row: T, actions: CardActions) => ReactNode;
    renderModal?: (props: RenderModalProps<T>) => ReactNode;
    createUrl?:
        | string
        | ((payload: Partial<Record<string, unknown>>) => string);
    updateUrl?: (row: T) => string;
    updateMethod?: 'PUT' | 'PATCH';
    enableCreate?: boolean;
    /** Label for the default create button (defaults to "New"). */
    createLabel?: string;
    enableEdit?: boolean;
    restoreUrl?: (row: T) => string;
    archiveUrl?: (row: T) => string;
    deleteUrl?: (row: T) => string;
    modalTitle?: (state: ModalState<T>) => string;
    onRestore?: (row: T, url: string) => Promise<void>;
    onArchive?: (row: T, url: string) => Promise<void>;
    onSuspend?: (row: T, url: string) => Promise<void>;
    onDelete?: (row: T, url: string) => Promise<void> | void;
    onCreated?: (saved: T) => void;
    onUpdated?: (saved: T) => void;
    onSaveError?: (error: Error) => void;
    onRefreshRef?: (fn: () => void) => void;
    inUseCheck?: (row: T, action: string) => Promise<InUseEntry[]>;
    enableSuspend?: boolean;
    enableStatusFilter?: boolean;
    statusFilterOptions?: StatusFilterTab[];
    extraFilters?: Record<string, unknown>;
    filterControls?: ReactNode;
    listHeader?: ReactNode;
    defaultSortBy?: string;
    defaultSortDir?: 'asc' | 'desc';
    createPermission?: string;
    editPermission?: string;
    archivePermission?: string;
    deletePermission?: string;
}
