/**
 * DataTable – reusable paginated table with column filters and global search.
 *
 * Props:
 *  apiUrl      – the JSON endpoint (e.g. "/settings/users/api")
 *  columns     – column definitions (see ColumnDef below)
 *  title?      – page/table heading
 *  description? – subheading text
 *
 * Column definition shape:
 *  {
 *    key: string          – matches the data key AND the backend column name
 *    label: string        – header display name
 *    filterable?: boolean – show a filter input in the header
 *    searchable?: boolean – just visual hint; actual search is global
 *    render?: (value, row) => ReactNode   – custom cell renderer
 *    sortable?: boolean   – allow clicking header to sort (default true)
 *    width?: string       – optional CSS width e.g. "200px"
 *  }
 *
 * Converted to Tailwind v4 – no external CSS file required.
 * CSS variables for theming are declared via a @layer base / :root block
 * injected with a <style> tag so the component remains self-contained.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import TableLoading from '../spinners/TableLoading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColumnDef<T = object> {
  key: string;
  label: string;
  filterable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}
interface ApiResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    prev: string | null;
    next: string | null;
  };
  filterable: string[];
  searchable: string[];
  filters: Record<string, string>;
  search: string;
  sort_by: string;
  sort_dir: 'asc' | 'desc';
}
interface DataTableProps<T> {
  apiUrl: string;
  columns: ColumnDef<T>[];
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onEdit?: (row: T) => void;
  onRestore?: (row: T) => void;
  onArchive?: (row: T) => void;
  onDelete?: (row: T) => void;
}

// ─── Hook: useDebouncedValue ──────────────────────────────────────────────────

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Debounce an object value (for column filters) */
function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [JSON.stringify(value), delay]); // eslint-disable-line react-hooks/exhaustive-deps

  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  apiUrl,
  columns,
  title,
  description
}: DataTableProps<T>) {
  // State
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterableCols, setFilterableCols] = useState<string[]>([]);
  const [searchableCols, setSearchableCols] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(searchInput);
  const debouncedFilters = useDebounced(columnFilters);
  const abortRef = useRef<AbortController | null>(null);

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
          Accept: 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: ApiResponse<T> = await res.json();
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
  }, [apiUrl, page, perPage, debouncedSearch, sortBy, sortDir, debouncedFilters]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, debouncedFilters, perPage]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };
  const handleColumnFilter = (col: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [col]: value
    }));
  };
  const clearAllFilters = () => {
    setSearchInput('');
    setColumnFilters({});
    setSortBy('id');
    setSortDir('asc');
    setPage(1);
  };
  const hasActiveFilters = searchInput || Object.values(columnFilters).some(Boolean);

  // ── Render ─────────────────────────────────────────────────────────────────

  return <div className="overflow-hidden rounded-[8px] border border-[#e2e8f0] font-[Inter,system-ui,-apple-system,sans-serif] text-[14px]" data-cy="data-table-div-1">
            {/* Header */}
            {(title || description) && <div className="px-6 pt-6" data-cy="data-table-div-2">
                    {title && <h1 className="m-0 mb-1 text-[20px] font-semibold tracking-[-0.01em]" data-cy="data-table-h1-3">
                            {title}
                        </h1>}
                    {description && <p className="m-0" data-cy="data-table-p-4">{description}</p>}
                </div>}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-[#e2e8f0] px-5 py-4" data-cy="data-table-div-5">
                {/* Search */}
                <div className="relative min-w-45 flex-[1_1_260px]" data-cy="data-table-div-6">
                    <SearchIcon data-cy="data-table-search-icon-7" />
                    <input type="text" className="box-border w-full rounded-[4px] border border-[#e2e8f0] py-2 pr-8 pl-8.5 text-[13px] transition-[border-color] duration-150 outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_2px_#eef2ff]" placeholder={searchableCols.length ? `Search by ${searchableCols.join(', ')}…` : 'Search…'} value={searchInput} onChange={e => setSearchInput(e.target.value)} data-cy="data-table-input-text" />
                    {searchInput && <button className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer border-none bg-transparent px-1 py-0.5 text-[16px] leading-none" onClick={() => setSearchInput('')} data-cy="data-table-button-set-search-input">
                            ×
                        </button>}
                </div>

                <div className="flex items-center gap-3" data-cy="data-table-div-10">
                    {hasActiveFilters && <button className="hover: inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-[#e2e8f0] bg-transparent px-3.5 py-1.75 text-[13px] font-medium transition-[background,color] duration-120" onClick={clearAllFilters} data-cy="data-table-button-clear-all-filters">
                            Clear filters
                        </button>}
                    <label className="flex items-center gap-1.5 text-[13px] whitespace-nowrap" data-cy="data-table-label-rows">
                        Rows
                        <select className="min-w-16 cursor-pointer rounded-[4px] border border-[#e2e8f0] px-2 py-1.5 text-[13px]" value={perPage} onChange={e => setPerPage(Number(e.target.value))} data-cy="data-table-select-set-per-page">
                            {[10, 15, 25, 50, 100].map(n => <option key={n} value={n} data-cy="data-table-option-14">
                                    {n}
                                </option>)}
                        </select>
                    </label>
                </div>
            </div>

            {/* Error */}
            {error && <div className="text-dt-danger flex items-center justify-between border-b border-[#fecaca] bg-[#fef2f2] px-5 py-2.5 text-[13px]" data-cy="data-table-div-15">
                    <span data-cy="data-table-span-16">{error}</span>
                    <button className="hover: hover: inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] border border-[#e2e8f0] bg-transparent px-3.5 py-1.75 text-[13px] font-medium transition-[background,color] duration-120" onClick={fetchData} data-cy="data-table-button-fetch-data">
                        Retry
                    </button>
                </div>}

            {/* Table */}
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]" data-cy="data-table-div-18">
                <table className="w-full border-collapse text-[13.5px]" data-cy="data-table-table-19">
                    <thead data-cy="data-table-thead-20">
                        <tr className="dark:bg-[#1c1c1c]" data-cy="data-table-tr-21">
                            {columns.map(col => {
              const isSortable = col.sortable !== false;
              const isActive = sortBy === col.key;
              return <th key={col.key} className={['border-b border-[#e2e8f0] p-0 text-left align-top font-semibold whitespace-nowrap', isActive ? 'bg-dt-accent-light text-[#6366f1] dark:bg-[#64748b]' : ''].filter(Boolean).join(' ')} style={col.width ? {
                width: col.width
              } : undefined} data-cy="data-table-th-22">
                                        <div className="flex flex-col gap-0" data-cy="data-table-div-23">
                                            <button className={['flex w-full items-center gap-1.25 border-none bg-transparent px-3.5 pt-2.5 pb-2 text-left text-[12px] font-semibold tracking-[0.04em] text-inherit uppercase', isSortable ? 'cursor-pointer' : 'cursor-default'].filter(Boolean).join(' ')} onClick={() => isSortable && handleSort(col.key)} disabled={!isSortable} data-cy="data-table-button-24">
                                                <span className="flex-1" data-cy="data-table-span-25">
                                                    {col.label}
                                                </span>
                                                {isSortable && <SortIcon active={isActive} dir={isActive ? sortDir : 'asc'} data-cy="data-table-sort-icon-26" />}
                                            </button>

                                            {(col.filterable || filterableCols.includes(col.key)) && <input type="text" className="mx-2 mb-2 box-border w-[calc(100%-16px)] rounded-[4px] border border-[#e2e8f0] bg-white px-2 py-1.25 font-mono text-[12px] transition-[border-color] duration-150 outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_2px_#eef2ff]" placeholder="Filter…" value={columnFilters[col.key] ?? ''} onChange={e => handleColumnFilter(col.key, e.target.value)} onClick={e => e.stopPropagation()} data-cy="data-table-input-text-2" />}
                                        </div>
                                    </th>;
            })}
                        </tr>
                    </thead>
                    <tbody data-cy="data-table-tbody-28">
                        {loading && rows.length === 0 ? <tr data-cy="data-table-tr-29">
                                <td colSpan={100 as unknown as number} className="px-5 py-12 text-center text-[14px]" data-cy="data-table-td-30">
                                    <TableLoading count={20} cols={columns.length} data-cy="data-table-table-loading-31" />
                                </td>
                            </tr> : rows.length === 0 ? <tr data-cy="data-table-tr-32">
                                <td colSpan={columns.length} className="px-5 py-12 text-center text-[14px]" data-cy="data-table-td-no-records-found">
                                    No records found.
                                    {hasActiveFilters && <button className="ml-1.5 cursor-pointer border-none bg-transparent p-0 text-[13px] text-[#6366f1] underline" onClick={clearAllFilters} data-cy="data-table-button-clear-all-filters-2">
                                            Clear filters
                                        </button>}
                                </td>
                            </tr> : rows.map((row, i) => <tr key={i} className={['hover: border-b border-[#e2e8f0] transition-[background] duration-100 last:border-b-0 dark:hover:bg-[#1c1c1c]', loading ? 'opacity-50' : ''].filter(Boolean).join(' ')} data-cy="data-table-tr-35">
                                    {columns.map(col => <td key={col.key} className="px-3.5 py-2.75 align-middle" data-cy="data-table-td-36">
                                            {col.render ? col.render(row[col.key], row) : formatCell(row[col.key])}
                                        </td>)}
                                </tr>)}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#e2e8f0] px-5 py-3" data-cy="data-table-div-37">
                    <span className="text-[12.5px]" data-cy="data-table-span-38">
                        {meta.from != null && meta.to != null ? `${meta.from}–${meta.to} of ${meta.total} records` : `${meta.total} records`}
                    </span>
                    <div className="flex items-center gap-1" data-cy="data-table-div-39">
                        <PageBtn disabled={page <= 1 || loading} onClick={() => setPage(1)} title="First page" data-cy="data-table-page-btn-first-page">
                            «
                        </PageBtn>
                        <PageBtn disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} title="Previous page" data-cy="data-table-page-btn-previous-page">
                            ‹
                        </PageBtn>
                        <PageNumbers current={page} total={meta.last_page} onChange={setPage} data-cy="data-table-page-numbers-set-page" />
                        <PageBtn disabled={page >= meta.last_page || loading} onClick={() => setPage(p => p + 1)} title="Next page" data-cy="data-table-page-btn-next-page">
                            ›
                        </PageBtn>
                        <PageBtn disabled={page >= meta.last_page || loading} onClick={() => setPage(meta.last_page)} title="Last page" data-cy="data-table-page-btn-last-page">
                            »
                        </PageBtn>
                    </div>
                </div>}
        </div>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shared page button to avoid repeating long class strings */
function PageBtn({
  children,
  disabled,
  onClick,
  title,
  active = false
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return <button className={['h-8 min-w-8 cursor-pointer rounded-[4px] border px-2 text-[13px] transition-[background,border-color] duration-100', active ? 'border-[#6366f1] bg-[#6366f1] font-semibold text-white hover:bg-[#6366f1] hover:text-white' : 'border-[#e2e8f0] hover:border-[#6366f1] hover:text-[#6366f1] disabled:cursor-not-allowed disabled:opacity-35'].filter(Boolean).join(' ')} disabled={disabled} onClick={onClick} title={title} data-cy="data-table-button-title">
            {children}
        </button>;
}
function PageNumbers({
  current,
  total,
  onChange
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
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push('…');
    }
    pages.push(total);
  }
  return <>
            {pages.map((p, i) => p === '…' ? <span key={`ellipsis-${i}`} className="px-1 text-[14px] select-none" data-cy="data-table-span-46">
                        …
                    </span> : <PageBtn key={p} active={p === current} onClick={() => onChange(p as number)} data-cy="data-table-page-btn-change">
                        {p}
                    </PageBtn>)}
        </>;
}
function SortIcon({
  active,
  dir
}: {
  active: boolean;
  dir: 'asc' | 'desc';
}) {
  return <span className={['text-[11px] not-italic transition-opacity duration-100', active ? 'text-[#6366f1] opacity-100' : 'opacity-50'].filter(Boolean).join(' ')} data-cy="data-table-span-48">
            {active ? dir === 'asc' ? '↑' : '↓' : '↕'}
        </span>;
}
function SearchIcon() {
  return <svg className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" viewBox="0 0 20 20" fill="none" aria-hidden="true" data-cy="data-table-svg-49">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" data-cy="data-table-circle-50" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>;
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