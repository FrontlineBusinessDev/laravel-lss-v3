/**
 * @file components/Toolbar.tsx
 * Search input, column-filter toggle, sort dropdown, and per-page selector.
 * Entirely controlled — all state lives in the parent (DataTableField).
 */

import {
    ArrowDown,
    ArrowUp,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import React from 'react';
import type { ColumnDef } from '../types';

interface ToolbarProps<T> {
    columns: ColumnDef<T>[];
    searchInput: string;
    onSearchChange: (v: string) => void;
    searchableCols: string[];

    sortBy: string;
    sortDir: 'asc' | 'desc';
    onSortByChange: (col: string) => void;
    onSortDirToggle: () => void;

    perPage: number;
    onPerPageChange: (n: number) => void;

    filtersOpen: boolean;
    onFiltersToggle: () => void;
    hasActiveColumnFilters: boolean;

    /**
     * Whether to render the "Filters" button at all. Owned by the parent so it
     * can account for both filterable columns AND the opt-in status filter.
     */
    showFiltersButton: boolean;

    /** Column filter panel content — rendered below when filtersOpen. */
    filterPanel: React.ReactNode;
}

/**
 * DataTable toolbar.
 *
 * Responsibilities:
 *  - Global search input with clear button
 *  - "Filters" button that reveals the per-column filter panel
 *  - Sort column dropdown + direction toggle
 *  - Rows-per-page selector
 */
export function Toolbar<T>({
    columns,
    searchInput,
    onSearchChange,
    searchableCols,
    sortBy,
    sortDir,
    onSortByChange,
    onSortDirToggle,
    perPage,
    onPerPageChange,
    filtersOpen,
    onFiltersToggle,
    hasActiveColumnFilters,
    showFiltersButton,
    filterPanel,
}: ToolbarProps<T>) {
    const sortableColumns = columns.filter((c) => c.sortable !== false);

    return (
        <div className="mb-4">
            {/* Top row: search + controls */}
            <div className="flex max-w-200 flex-col gap-3 sm:flex-row sm:items-center">
                {/* Global search */}
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                        strokeWidth={1.75}
                    />
                    <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-9 text-sm outline-none
                            placeholder:text-slate-400 transition-shadow
                            focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
                        placeholder={
                            searchableCols.length
                                ? `Search by ${searchableCols.join(', ')}…`
                                : 'Search…'
                        }
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5"
                            onClick={() => onSearchChange('')}
                            aria-label="Clear search"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Right-side controls */}
                <div className="flex items-center gap-2">
                    {/* Filters toggle — shown when filterable columns or the
                        opt-in status filter make the panel non-empty */}
                    {showFiltersButton && (
                        <button
                            type="button"
                            onClick={onFiltersToggle}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors
                                ${filtersOpen || hasActiveColumnFilters
                                    ? 'border-slate-300'
                                    : 'border-slate-200'}`}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
                            Filters
                        </button>
                    )}

                    {/* Sort column + direction */}
                    {sortableColumns.length > 0 && (
                        <div className="relative inline-flex min-w-40 items-center">
                            <select
                                value={sortBy}
                                onChange={(e) => onSortByChange(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pr-8 pl-3
                                    text-sm font-medium outline-none hover:bg-slate-50 focus:border-slate-300"
                            >
                                {sortableColumns.map((c) => (
                                    <option key={c.key} value={c.key}>
                                        Sort: {c.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={onSortDirToggle}
                                className="absolute right-1.5 rounded-md p-0.5"
                                title={`Currently ${sortDir} — click to toggle`}
                            >
                                {sortDir === 'asc'
                                    ? <ArrowUp className="h-3.5 w-3.5" />
                                    : <ArrowDown className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    )}

                    {/* Per-page selector */}
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="min-w-30 rounded-xl border border-slate-200 px-3 py-2.5
                            text-sm font-medium outline-none focus:border-slate-300"
                        title="Rows per page"
                    >
                        {[10, 15, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>{n} / page</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expandable per-column filter panel */}
            {filtersOpen && filterPanel}
        </div>
    );
}
