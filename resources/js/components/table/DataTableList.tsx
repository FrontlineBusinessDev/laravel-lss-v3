/**
 * DataTableList – reusable paginated card list with column filters, global search,
 * and dynamic create/edit modals.
 *
 * Visual style: stacked record cards (Tailwind v4) instead of a classic <table>.
 *
 * ─── Dynamic columns ───────────────────────────────────────────────────────────
 * `columns` drives the card body, sort dropdown, and filter inputs, same as before.
 *
 * ─── Dynamic fields (NEW) ──────────────────────────────────────────────────────
 * `fields` drives the Create / Edit modal forms. Each FieldDef describes one input.
 * If you don't pass `fields`, the component derives a best-effort field list from
 * `columns` (all text inputs) so the modals still work out of the box.
 *
 * Field definition shape:
 *  {
 *    key: string                 – matches the data key AND the payload key sent to the API
 *    label: string                – input label
 *    type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' |
 *           'async-select' | 'checkbox' | 'date' | 'datetime-local'   (default: 'text')
 *    options?: { label: string; value: string | number }[]   – required for type "select"
 *    loadOptions?, getOptionLabel?, debounceMs?, minSearchLength?   – for "async-select"
 *    required?: boolean
 *    placeholder?: string
 *    helpText?: string
 *    defaultValue?: unknown        – used when creating a new record
 *    showOnCreate?: boolean        – default true
 *    showOnEdit?: boolean          – default true
 *    colSpan?: 1 | 2               – form grid span (default 1, full-width inputs use 2)
 *    validate?: (value, formValues) => string | null   – return an error message or null
 *    transform?: (value) => unknown   – transform value before it is sent to the API
 *  }
 *
 * ─── Create / Edit wiring ──────────────────────────────────────────────────────
 *  createUrl?      – endpoint for POST (defaults to apiUrl)
 *  updateUrl?       – function building the PUT/PATCH endpoint for a row (defaults to `${apiUrl}/${row.id}`)
 *  updateMethod?    – 'PUT' | 'PATCH' (default 'PUT')
 *  enableCreate?    – show the "New" button in the toolbar (default true if `fields` resolved)
 *  enableEdit?      – show the edit affordance on each card (default true if `fields` resolved)
 *  modalTitle?      – ({mode, row}) => string, custom modal heading
 *  onCreated?       – called with the created row after a successful POST
 *  onUpdated?       – called with the updated row after a successful PUT/PATCH
 *  onSaveError?     – called with the error if the save request fails
 */
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { useToast } from '@/hooks/use-toast';
import type {
  DataTableProps,
  ModalMode,
  PaginationMeta,
  TableApiResponse,
} from '@/types/reusable/data-table';
import type { ColumnDef, FieldDef, FieldType } from '@/types/reusable/fields';
import { usePage } from '@inertiajs/react';
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ─── Hook: useDebouncedValue ──────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(value), delay]);
    return debounced;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCell(value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return String(value);
}

/** Build a sensible default field list from columns when `fields` isn't provided. */
function deriveFieldsFromColumns<T>(columns: ColumnDef<T>[]): FieldDef<T>[] {
    return columns
        .filter((c) => c.key !== 'id')
        .map((c) => ({
            key: c.key,
            label: c.label,
            type: 'text' as FieldType,
        }));
}
function isFieldVisible<T>(field: FieldDef<T>, mode: ModalMode): boolean {
    if (mode === 'create') {
        return field.showOnCreate !== false;
    }
    return field.showOnEdit !== false;
}
function isFieldDisabled<T>(
    field: FieldDef<T>,
    mode: ModalMode,
    row?: T,
): boolean {
    if (typeof field.disabled === 'function') {
        return field.disabled(mode, row);
    }
    return Boolean(field.disabled);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTableList<T extends Record<string, unknown>>({
    apiUrl,
    columns,
    fields,
    title,
    description,
    renderCard,
    createUrl,
    updateUrl,
    updateMethod = 'PUT',
    restoreUrl,
    archiveUrl,
    deleteUrl,
    enableCreate,
    enableEdit,
    modalTitle,
    onRestore,
    onArchive,
    onDelete,
    onCreated,
    onUpdated,
    onSaveError,
}: DataTableProps<T>) {
    const { toast } = useToast();
    const currentUserId = usePage().props.auth.user.id;
    // State
    const [rows, setRows] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // ── Delete confirmation state ────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);
    const isCurrenUserDelete =
        apiUrl == '/settings/users/api' && deleteTarget?.id == currentUserId;
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
        {},
    );
    const [sortBy, setSortBy] = useState(columns[0]?.key ?? 'id');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Track which backend columns are filterable/searchable (from API)
    const [filterableCols, setFilterableCols] = useState<string[]>([]);
    const [searchableCols, setSearchableCols] = useState<string[]>([]);
    const debouncedSearch = useDebouncedValue(searchInput);
    const debouncedFilters = useDebouncedValue(columnFilters);
    const abortRef = useRef<AbortController | null>(null);

    // ── Dynamic fields resolution ────────────────────────────────────────────
    const resolvedFields = useMemo<FieldDef<T>[]>(
        () => fields ?? deriveFieldsFromColumns(columns),
        [fields, columns],
    );
    const canCreate = enableCreate ?? resolvedFields.length > 0;
    const canEdit = enableEdit ?? resolvedFields.length > 0;

    // ── Modal state ───────────────────────────────────────────────────────────
    const [modalState, setModalState] = useState<{
        mode: ModalMode;
        row?: T;
    } | null>(null);
    const openCreateModal = () =>
        setModalState({
            mode: 'create',
        });
    const openEditModal = (row: T) =>
        setModalState({
            mode: 'edit',
            row,
        });
    const closeModal = () => setModalState(null);
    // ── Default lifecycle endpoint conventions (overridable via props) ──────
    const getRowId = (row: T) =>
        String((row as Record<string, unknown>).id ?? '');
    const getRestorePath = (row: T) =>
        restoreUrl ? restoreUrl(row) : `${apiUrl}/${getRowId(row)}/restore`;
    const getArchivePath = (row: T) =>
        archiveUrl ? archiveUrl(row) : `${apiUrl}/${getRowId(row)}/archive`;
    const getDeletePath = (row: T) =>
        deleteUrl ? deleteUrl(row) : `${apiUrl}/${getRowId(row)}`;

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('per_page', String(perPage));
            if (debouncedSearch) {
                params.set('search', debouncedSearch);
            }
            params.set('sort_by', sortBy);
            params.set('sort_dir', sortDir);
            Object.entries(debouncedFilters).forEach(([col, val]) => {
                if (val) {
                    params.set(`filters[${col}]`, val);
                }
            });
            const res = await fetch(`${apiUrl}?${params.toString()}`, {
                signal: ctrl.signal,
                headers: {
                    Accept: 'application/json',
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json: TableApiResponse<T> = await res.json();
            setRows(json.data);
            setMeta(json.meta);
            setFilterableCols(json.filterable ?? []);
            setSearchableCols(json.searchable ?? []);
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message ?? 'Failed to load data.');
            }
        } finally {
            setLoading(false);
        }
    }, [
        apiUrl,
        page,
        perPage,
        debouncedSearch,
        sortBy,
        sortDir,
        debouncedFilters,
    ]);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    // Reset to page 1 when filters/search change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch, debouncedFilters, perPage]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleSortChange = (col: string) => {
        if (sortBy === col) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(col);
            setSortDir('asc');
        }
        setPage(1);
    };
    const handleColumnFilter = (col: string, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [col]: value,
        }));
    };
    const clearAllFilters = () => {
        setSearchInput('');
        setColumnFilters({});
        setPage(1);
    };
    const hasActiveFilters =
        Boolean(searchInput) || Object.values(columnFilters).some(Boolean);
    const sortableColumns = columns.filter((c) => c.sortable !== false);
    const filterCols = columns.filter(
        (c) => c.filterable || filterableCols.includes(c.key),
    );

    // ── Save handler (create or update) ──────────────────────────────────────

    const handleSave = async (values: Record<string, unknown>) => {
        if (!modalState) {
            return;
        }
        const { mode, row } = modalState;
        const payload: Record<string, unknown> = {};
        resolvedFields
            .filter((f) => isFieldVisible(f, mode))
            .forEach((f) => {
                const raw = values[f.key];
                payload[f.key] = f.transform ? f.transform(raw) : raw;
            });
        const url =
            mode === 'create'
                ? (createUrl ?? apiUrl)
                : updateUrl
                  ? updateUrl(row as T)
                  : `${apiUrl}/${String((row as T)?.id ?? '')}`;
        const method = mode === 'create' ? 'POST' : updateMethod;
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            let message = `HTTP ${res.status}`;
            try {
                const body = await res.json();
                message = body?.message ?? message;
                throw Object.assign(new Error(message), {
                    errors: body?.errors,
                });
            } catch (err: unknown) {
                const error =
                    err instanceof Error
                        ? err
                        : new Error('Failed to save record.');
                toast({
                    title:
                        mode === 'create' ? 'Create failed' : 'Update failed',
                    description: error.message,
                    variant: 'error',
                });
                onSaveError?.(error);
                throw new Error(message);
            }
        }
        const saved: T = await res.json().catch(() => ({}) as T);
        if (mode === 'create') {
            toast({
                title: `${title ?? 'Record'} created`,
                variant: 'success',
            });
            onCreated?.(saved);
        } else {
            toast({
                title: `${title ?? 'Record'} updated`,
                variant: 'success',
            });
            onUpdated?.(saved);
        }
        closeModal();
        fetchData();
    };

    // ── ACTIONS ─────────────────────────────────────────────────────────────────

    const handleRestore = async (row: T) => {
        const pathApi = getRestorePath(row);
        await onRestore?.(row, pathApi);
        toast({
            title: 'Restored',
            variant: 'info',
        });
        fetchData();
    };
    const handleArchive = async (row: T) => {
        const pathApi = getArchivePath(row);
        await onArchive?.(row, pathApi);
        toast({
            title: 'Archived',
            variant: 'info',
        });
        fetchData();
    };
    const requestDelete = (row: T) => setDeleteTarget(row);
    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }
        const row = deleteTarget;
        const pathApi = getDeletePath(row);
        setDeleting(true);
        try {
            await onDelete?.(row, pathApi);
            toast({
                title: 'Deleted',
                variant: 'info',
            });
            if (isCurrenUserDelete) {
                window.location.href = '/login';
            }
            setDeleteTarget(null);
            fetchData();
        } catch (err: unknown) {
            const error =
                err instanceof Error ? err : new Error('Failed to delete.');
            toast({
                title: 'Delete failed',
                description: error.message,
                variant: 'error',
            });
        } finally {
            setDeleting(false);
        }
    };

    // ── Default card body (used when renderCard isn't supplied) ─────────────────

    const defaultCard = (row: T, idx: number) => {
        const [titleCol, ...rest] = columns;
        const titleValue = formatCell(row[titleCol?.key]);
        return (
            <div
                key={idx}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                data-cy="data-table-list-div-1"
            >
                <div className="min-w-0 flex-1" data-cy="data-table-list-div-2">
                    <h3
                        className="truncate text-base font-semibold text-slate-900"
                        data-cy="data-table-list-h3-3"
                    >
                        {titleValue}
                    </h3>
                    <dl
                        className="mt-1 space-y-0.5"
                        data-cy="data-table-list-dl-4"
                    >
                        {rest.map((col) => {
                            const value = col.render
                                ? col.render(row[col.key], row)
                                : formatCell(row[col.key]);
                            if (
                                value === '—' ||
                                value === '' ||
                                value == null
                            ) {
                                return null;
                            }
                            return (
                                <dd
                                    key={col.key}
                                    className="truncate text-sm text-slate-500"
                                    data-cy="data-table-list-dd-5"
                                >
                                    {value}
                                </dd>
                            );
                        })}
                    </dl>
                </div>
                <div
                    className="flex shrink-0 items-center gap-3 pt-0.5"
                    data-cy="data-table-list-div-6"
                >
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="Edit"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            data-cy="data-table-list-button-edit"
                        >
                            <Pencil
                                className="size-4.5"
                                strokeWidth={1.75}
                                data-cy="data-table-list-pencil-8"
                            />
                        </button>
                    )}
                    {row.status == 'active' ? (
                        <button
                            type="button"
                            onClick={() => handleArchive(row)}
                            title="Archive"
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            data-cy="data-table-list-button-archive"
                        >
                            <Archive
                                className="size-4.5"
                                strokeWidth={1.75}
                                data-cy="data-table-list-archive-10"
                            />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleRestore(row)}
                            title="Restore"
                            className="rounded-md p-1.5 text-yellow-400 transition-colors hover:bg-yellow-100 hover:text-yellow-700"
                            data-cy="data-table-list-button-restore"
                        >
                            <ArchiveRestore
                                className="size-4.5"
                                strokeWidth={1.75}
                                data-cy="data-table-list-archive-restore-12"
                            />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => requestDelete(row)}
                        title="Delete"
                        className="rounded-md p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        data-cy="data-table-list-button-delete"
                    >
                        <Trash2
                            className="size-4.5"
                            strokeWidth={1.75}
                            data-cy="data-table-list-trash2-14"
                        />
                    </button>
                </div>
            </div>
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="mx-auto w-full" data-cy="data-table-list-div-15">
            {/* Header */}
            {(title || description || canCreate) && (
                <div
                    className="mb-6 flex items-center justify-between gap-4"
                    data-cy="data-table-list-div-16"
                >
                    <div data-cy="data-table-list-div-17">
                        {title && (
                            <h1
                                className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
                                data-cy="data-table-list-h1-18"
                            >
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p
                                className="mt-1 text-sm text-slate-500 dark:text-white"
                                data-cy="data-table-list-p-19"
                            >
                                {description}
                            </p>
                        )}
                    </div>
                    {canCreate && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="brand-400 hover:brand-400/90 inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
                            data-cy="data-table-list-button-button"
                        >
                            <Plus
                                className="h-4 w-4"
                                strokeWidth={2}
                                data-cy="data-table-list-plus-21"
                            />
                            New
                        </button>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div
                className="mb-4 flex max-w-200 flex-col gap-3 sm:flex-row sm:items-center"
                data-cy="data-table-list-div-22"
            >
                <div
                    className="relative flex-1"
                    data-cy="data-table-list-div-23"
                >
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                        strokeWidth={1.75}
                        data-cy="data-table-list-search-24"
                    />
                    <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-9 text-sm text-slate-900 transition-shadow outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        placeholder={
                            searchableCols.length
                                ? `Search by ${searchableCols.join(', ')}…`
                                : 'Search…'
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        data-cy="data-table-list-input-text"
                    />
                    {searchInput && (
                        <button
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            onClick={() => setSearchInput('')}
                            data-cy="data-table-list-button-set-search-input"
                        >
                            <X
                                className="h-3.5 w-3.5"
                                data-cy="data-table-list-x-27"
                            />
                        </button>
                    )}
                </div>

                <div
                    className="flex items-center gap-2"
                    data-cy="data-table-list-div-28"
                >
                    {filterCols.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setFiltersOpen((o) => !o)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${filtersOpen || Object.values(columnFilters).some(Boolean) ? 'border-slate-300 bg-slate-50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                            data-cy="data-table-list-button-button-2"
                        >
                            <SlidersHorizontal
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                                data-cy="data-table-list-sliders-horizontal-30"
                            />
                            Filters
                        </button>
                    )}

                    {sortableColumns.length > 0 && (
                        <div
                            className="relative inline-flex min-w-40 items-center"
                            data-cy="data-table-list-div-31"
                        >
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-3 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus:border-slate-300"
                                data-cy="data-table-list-select-sort-change"
                            >
                                {sortableColumns.map((c) => (
                                    <option
                                        key={c.key}
                                        value={c.key}
                                        data-cy="data-table-list-option-sort"
                                    >
                                        Sort: {c.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() =>
                                    setSortDir((d) =>
                                        d === 'asc' ? 'desc' : 'asc',
                                    )
                                }
                                className="absolute right-1.5 rounded-md p-0.5 text-slate-500 hover:bg-slate-100"
                                title="Toggle sort direction"
                                data-cy="data-table-list-button-toggle-sort-direction"
                            >
                                {sortDir === 'asc' ? (
                                    <ArrowUp
                                        className="h-3.5 w-3.5"
                                        data-cy="data-table-list-arrow-up-35"
                                    />
                                ) : (
                                    <ArrowDown
                                        className="h-3.5 w-3.5"
                                        data-cy="data-table-list-arrow-down-36"
                                    />
                                )}
                            </button>
                        </div>
                    )}

                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="min-w-30 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus:border-slate-300"
                        title="Rows per page"
                        data-cy="data-table-list-select-rows-per-page"
                    >
                        {[10, 15, 25, 50, 100].map((n) => (
                            <option
                                key={n}
                                value={n}
                                data-cy="data-table-list-option-page"
                            >
                                {n} / page
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expandable per-column filters */}
            {filtersOpen && filterCols.length > 0 && (
                <div
                    className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
                    data-cy="data-table-list-div-39"
                >
                    {filterCols.map((col) => (
                        <label
                            key={col.key}
                            className="block"
                            data-cy="data-table-list-label-40"
                        >
                            <span
                                className="mb-1 block text-xs font-medium text-slate-500"
                                data-cy="data-table-list-span-41"
                            >
                                {col.label}
                            </span>
                            <input
                                type="text"
                                value={columnFilters[col.key] ?? ''}
                                onChange={(e) =>
                                    handleColumnFilter(col.key, e.target.value)
                                }
                                placeholder={`Filter by ${col.label.toLowerCase()}…`}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                                data-cy="data-table-list-input-text-2"
                            />
                        </label>
                    ))}
                </div>
            )}

            {hasActiveFilters && (
                <div
                    className="mb-4 flex items-center justify-between"
                    data-cy="data-table-list-div-43"
                >
                    <span
                        className="text-xs text-slate-500"
                        data-cy="data-table-list-span-filters-applied"
                    >
                        Filters applied
                    </span>
                    <button
                        onClick={clearAllFilters}
                        className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                        data-cy="data-table-list-button-clear-all-filters"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    data-cy="data-table-list-div-46"
                >
                    <span data-cy="data-table-list-span-47">⚠ {error}</span>
                    <button
                        onClick={fetchData}
                        className="font-medium underline-offset-2 hover:underline"
                        data-cy="data-table-list-button-fetch-data"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Cards */}
            <div className="space-y-3" data-cy="data-table-list-div-49">
                {loading && rows.length === 0 ? (
                    Array.from({
                        length: 4,
                    }).map((_, i) => (
                        <div
                            key={i}
                            className="h-22 animate-pulse rounded-2xl border border-slate-200 bg-gray-300/70 dark:bg-gray-300/30"
                            data-cy="data-table-list-div-50"
                        />
                    ))
                ) : rows.length === 0 ? (
                    <div
                        className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center"
                        data-cy="data-table-list-div-51"
                    >
                        <p
                            className="text-sm text-slate-500"
                            data-cy="data-table-list-p-no-records-found"
                        >
                            No records found.
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-2 text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                                data-cy="data-table-list-button-clear-all-filters-2"
                            >
                                Clear filters
                            </button>
                        )}
                    </div> /* eslint-disable react-hooks/refs */
                ) : (
                    rows.map((row, i) =>
                        renderCard ? (
                            <React.Fragment key={i}>
                                {renderCard(row, {
                                    onRestore: () => handleRestore(row),
                                    onArchive: () => handleArchive(row),
                                    onDelete: () => requestDelete(row),
                                    onEdit: () => openEditModal(row),
                                })}
                            </React.Fragment>
                        ) : (
                            defaultCard(row, i)
                        ),
                    )
                    /* eslint-enable react-hooks/refs */
                )}
            </div>

            {/* Pagination */}
            {meta && meta.total > 0 && (
                <div
                    className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
                    data-cy="data-table-list-div-55"
                >
                    <span
                        className="text-sm text-slate-500 dark:text-white"
                        data-cy="data-table-list-span-56"
                    >
                        {meta.from != null && meta.to != null
                            ? `${meta.from}–${meta.to} of ${meta.total} records`
                            : `${meta.total} records`}
                    </span>
                    <div
                        className="flex items-center gap-1"
                        data-cy="data-table-list-div-57"
                    >
                        <PageBtn
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(1)}
                            title="First page"
                            data-cy="data-table-list-page-btn-first-page"
                        >
                            <ChevronsLeft
                                className="h-4 w-4"
                                data-cy="data-table-list-chevrons-left-59"
                            />
                        </PageBtn>
                        <PageBtn
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => p - 1)}
                            title="Previous page"
                            data-cy="data-table-list-page-btn-previous-page"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                data-cy="data-table-list-chevron-left-61"
                            />
                        </PageBtn>
                        <PageNumbers
                            current={page}
                            total={meta.last_page}
                            onChange={setPage}
                            data-cy="data-table-list-page-numbers-set-page"
                        />
                        <PageBtn
                            disabled={page >= meta.last_page || loading}
                            onClick={() => setPage((p) => p + 1)}
                            title="Next page"
                            data-cy="data-table-list-page-btn-next-page"
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                data-cy="data-table-list-chevron-right-64"
                            />
                        </PageBtn>
                        <PageBtn
                            disabled={page >= meta.last_page || loading}
                            onClick={() => setPage(meta.last_page)}
                            title="Last page"
                            data-cy="data-table-list-page-btn-last-page"
                        >
                            <ChevronsRight
                                className="h-4 w-4"
                                data-cy="data-table-list-chevrons-right-66"
                            />
                        </PageBtn>
                    </div>
                </div>
            )}

            {/* Dynamic create / edit modal */}
            {modalState && (
                <RecordModal
                    mode={modalState.mode}
                    row={modalState.row}
                    fields={resolvedFields}
                    title={
                        modalTitle?.(modalState) ??
                        (modalState.mode === 'create'
                            ? `New ${title ?? 'record'}`
                            : `Edit ${title ?? 'record'}`)
                    }
                    onClose={closeModal}
                    onSubmit={handleSave}
                    onError={onSaveError}
                    data-cy="data-table-list-record-modal-close-modal"
                />
            )}

            <ConfirmDeleteModal
                open={deleteTarget !== null}
                busy={deleting}
                label={
                    deleteTarget
                        ? formatCell(deleteTarget[columns[0]?.key])
                        : undefined
                }
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                isCurrenUserDelete={isCurrenUserDelete}
                data-cy="data-table-list-confirm-delete-modal-68"
            />
        </div>
    );
}

// ─── RecordModal (dynamic create/edit form) ──────────────────────────────────

interface RecordModalProps<T> {
    mode: ModalMode;
    row?: T;
    fields: FieldDef<T>[];
    title: string;
    onClose: () => void;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    onError?: (error: Error) => void;
}
function RecordModal<T extends Record<string, unknown>>({
    mode,
    row,
    fields,
    title,
    onClose,
    onSubmit,
    onError,
}: RecordModalProps<T>) {
    const visibleFields = useMemo(
        () => fields.filter((f) => isFieldVisible(f, mode)),
        [fields, mode],
    );
    const initialValues = useMemo(() => {
        const init: Record<string, unknown> = {};
        visibleFields.forEach((f) => {
            if (mode === 'edit' && row) {
                init[f.key] = row[f.key] ?? '';
            } else {
                init[f.key] =
                    f.defaultValue ?? (f.type === 'checkbox' ? false : '');
            }
        });
        return init;
    }, [visibleFields, mode, row]);
    const [values, setValues] =
        useState<Record<string, unknown>>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);
    const setValue = (key: string, value: unknown) => {
        setValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        setFieldErrors((prev) => ({
            ...prev,
            [key]: '',
        }));
    };
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        visibleFields.forEach((f) => {
            const value = values[f.key];
            if (
                f.required &&
                (value === '' || value === null || value === undefined)
            ) {
                errs[f.key] = `${f.label} is required.`;
                return;
            }
            const customError = f.validate?.(value, values);
            if (customError) {
                errs[f.key] = customError;
            }
        });
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!validate()) {
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(values);
        } catch (err: unknown) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to save record.');
            const apiErrors = (
                error as Error & {
                    errors?: Record<string, string[]>;
                }
            ).errors;
            if (apiErrors) {
                const mapped: Record<string, string> = {};
                Object.entries(apiErrors).forEach(([key, msgs]) => {
                    mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                });
                setFieldErrors((prev) => ({
                    ...prev,
                    ...mapped,
                }));
            }
            setFormError(error.message);
            onError?.(error);
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            data-cy="data-table-list-div-69"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
                data-cy="data-table-list-div-70"
            >
                <div
                    className="flex items-center justify-between border-b border-slate-100 px-6 py-4"
                    data-cy="data-table-list-div-71"
                >
                    <h2
                        className="text-lg font-semibold text-slate-900"
                        data-cy="data-table-list-h2-72"
                    >
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        data-cy="data-table-list-button-button-3"
                    >
                        <X className="h-4 w-4" data-cy="data-table-list-x-74" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    data-cy="data-table-list-form-submit"
                >
                    <div
                        className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2"
                        data-cy="data-table-list-div-76"
                    >
                        {visibleFields.map((f) => (
                            <div
                                key={f.key}
                                className={
                                    f.colSpan === 2
                                        ? 'col-span-1 sm:col-span-2'
                                        : 'col-span-1'
                                }
                                data-cy="data-table-list-div-77"
                            >
                                <DynamicField
                                    field={f}
                                    value={values[f.key]}
                                    error={fieldErrors[f.key]}
                                    disabled={(() => {
                                        const d =
                                            submitting ||
                                            isFieldDisabled(f, mode, row);
                                        return d;
                                    })()}
                                    onChange={(v) => setValue(f.key, v)}
                                    data-cy="data-table-list-dynamic-field-set-value"
                                />
                            </div>
                        ))}
                    </div>

                    {formError && (
                        <div
                            className="mx-6 mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                            data-cy="data-table-list-div-79"
                        >
                            {formError}
                        </div>
                    )}

                    <div
                        className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4"
                        data-cy="data-table-list-div-80"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            data-cy="data-table-list-button-button-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="brand-400 hover:brand-400/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                            data-cy="data-table-list-button-submit"
                        >
                            {submitting && (
                                <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    data-cy="data-table-list-loader2-83"
                                />
                            )}
                            {mode === 'create' ? 'Create' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({
    open,
    busy,
    label,
    onCancel,
    onConfirm,
    isCurrenUserDelete,
}: {
    open: boolean;
    busy?: boolean;
    label?: string;
    onCancel: () => void;
    onConfirm: () => void;
    isCurrenUserDelete?: boolean;
}) {
    if (!open) {
        return null;
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel();
                }
            }}
            data-cy="data-table-list-div-84"
        >
            <div
                role="alertdialog"
                aria-modal="true"
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
                data-cy="data-table-list-div-85"
            >
                {isCurrenUserDelete ? (
                    <h2
                        className="text-lg font-semibold text-slate-900"
                        data-cy="data-table-list-h2-are-you-sure-you-want-to"
                    >
                        Are you sure you want to delete your own record?
                        <span
                            className="block text-sm text-primary"
                            data-cy="data-table-list-span-you-will-be-automatically-logout"
                        >
                            You will be automatically logout.
                        </span>
                    </h2>
                ) : (
                    <h2
                        className="text-lg font-semibold text-slate-900"
                        data-cy="data-table-list-h2-delete"
                    >
                        Delete {label ?? 'this record'}?
                    </h2>
                )}
                <p
                    className="mt-1.5 text-sm text-slate-500"
                    data-cy="data-table-list-p-this-action-cannot-be-undone-the"
                >
                    This action cannot be undone. The record will be permanently
                    removed.
                </p>
                <div
                    className="mt-6 flex items-center justify-end gap-2"
                    data-cy="data-table-list-div-90"
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        data-cy="data-table-list-button-button-5"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                        data-cy="data-table-list-button-button-6"
                    >
                        {busy && (
                            <Loader2
                                className="h-3.5 w-3.5 animate-spin"
                                data-cy="data-table-list-loader2-93"
                            />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── DynamicField (renders the right input for a FieldDef) ──────────────────

function DynamicField<T>({
    field,
    value,
    error,
    disabled,
    onChange,
}: {
    field: FieldDef<T>;
    value: unknown;
    error?: string;
    disabled?: boolean;
    onChange: (value: unknown) => void;
}) {
    const baseInputClasses =
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50 disabled:text-slate-400';
    const borderClasses = error
        ? 'border-rose-300 focus:border-rose-400'
        : 'border-slate-200 focus:border-slate-300';
    if (field.type === 'async-select') {
        return (
            <>
                <span
                    className="mb-1 block text-xs font-medium text-slate-500"
                    data-cy="data-table-list-span-94"
                >
                    {field.label}
                    {field.required && (
                        <span
                            className="ml-0.5 text-rose-500"
                            data-cy="data-table-list-span-95"
                        >
                            *
                        </span>
                    )}
                </span>
                <AsyncSelectField
                    value={value}
                    onChange={onChange}
                    loadOptions={field.loadOptions!}
                    getOptionLabel={field.getOptionLabel}
                    placeholder={field.placeholder}
                    debounceMs={field.debounceMs}
                    minSearchLength={field.minSearchLength}
                    disabled={disabled}
                    error={error}
                    data-cy="data-table-list-async-select-field-field-placeholder"
                />
            </>
        );
    }
    if (field.type === 'checkbox') {
        return (
            <label
                className="flex items-center gap-2"
                data-cy="data-table-list-label-97"
            >
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                    data-cy="data-table-list-input-checkbox"
                />
                <span
                    className="text-sm font-medium text-slate-700"
                    data-cy="data-table-list-span-99"
                >
                    {field.label}
                </span>
            </label>
        );
    }
    return (
        <label className="block" data-cy="data-table-list-label-100">
            <span
                className="mb-1 block text-xs font-medium text-slate-500"
                data-cy="data-table-list-span-101"
            >
                {field.label}
                {field.required && (
                    <span
                        className="ml-0.5 text-rose-500"
                        data-cy="data-table-list-span-102"
                    >
                        *
                    </span>
                )}
            </span>

            {field.type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={(value as string) ?? ''}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseInputClasses} ${borderClasses} resize-none`}
                    data-cy="data-table-list-textarea-field-placeholder"
                />
            ) : field.type === 'select' ? (
                <select
                    value={(value as string | number) ?? ''}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${baseInputClasses} ${borderClasses}`}
                    data-cy="data-table-list-select-change"
                >
                    <option
                        value=""
                        disabled
                        data-cy="data-table-list-option-105"
                    >
                        {field.placeholder ??
                            `Select ${field.label.toLowerCase()}…`}
                    </option>
                    {field.options?.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            data-cy="data-table-list-option-106"
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type ?? 'text'}
                    value={(value as string | number) ?? ''}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                        onChange(
                            field.type === 'number'
                                ? e.target.valueAsNumber
                                : e.target.value,
                        )
                    }
                    className={`${baseInputClasses} ${borderClasses}`}
                    data-cy="data-table-list-input-field-placeholder"
                />
            )}

            {field.helpText && !error && (
                <span
                    className="mt-1 block text-xs text-slate-400"
                    data-cy="data-table-list-span-108"
                >
                    {field.helpText}
                </span>
            )}
            {error && (
                <span
                    className="mt-1 block text-xs text-rose-500"
                    data-cy="data-table-list-span-109"
                >
                    {error}
                </span>
            )}
        </label>
    );
}

// ─── Pagination sub-components ───────────────────────────────────────────────

function PageBtn({
    children,
    disabled,
    onClick,
    title,
    active,
}: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick: () => void;
    title?: string;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            title={title}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            data-cy="data-table-list-button-title"
        >
            {children}
        </button>
    );
}
function PageNumbers({
    current,
    total,
    onChange,
}: {
    current: number;
    total: number;
    onChange: (p: number) => void;
}) {
    const pages: (number | '…')[] = [];
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);
        if (current > 3) {
            pages.push('…');
        }
        for (
            let i = Math.max(2, current - 1);
            i <= Math.min(total - 1, current + 1);
            i++
        ) {
            pages.push(i);
        }
        if (current < total - 2) {
            pages.push('…');
        }
        pages.push(total);
    }
    return (
        <>
            {pages.map((p, i) =>
                p === '…' ? (
                    <span
                        key={`ellipsis-${i}`}
                        className="px-1.5 text-sm text-slate-400"
                        data-cy="data-table-list-span-111"
                    >
                        …
                    </span>
                ) : (
                    <PageBtn
                        key={p}
                        active={p === current}
                        onClick={() => onChange(p as number)}
                        data-cy="data-table-list-page-btn-change"
                    >
                        {p}
                    </PageBtn>
                ),
            )}
        </>
    );
}
export default DataTableList;
