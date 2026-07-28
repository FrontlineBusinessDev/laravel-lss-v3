/**
 * @file components/GlobalSearch.tsx
 * The global "powerful search" overlay (Ctrl+K / Cmd+K). Mounted once in
 * `AppLayout.tsx`, opened via `useGlobalSearchTrigger().open()` from any nav
 * button. Data comes from `useGlobalSearch()` (`GET /search`, debounced,
 * already role-scoped server-side) — this component only renders the
 * backdrop, input, and result list, and navigates on click.
 */

import { useGlobalSearch } from '@/hooks/use-global-search';
import { useGlobalSearchTrigger } from '@/contexts/GlobalSearchContext';
import { router } from '@inertiajs/react';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function GlobalSearch() {
    const { isOpen, close } = useGlobalSearchTrigger();
    const { query, setQuery, groups, loading, hasQuery, reset } =
        useGlobalSearch();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const totalResults = groups.reduce((n, g) => n + g.results.length, 0);

    const handleSelect = (url: string) => {
        close();
        router.visit(url);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-[2px]"
            onClick={close}
            data-cy="global-search-backdrop"
        >
            <div
                className="mx-auto mt-24 w-full max-w-lg px-4"
                onClick={(e) => e.stopPropagation()}
                data-cy="global-search-panel"
            >
                <div className="animate-scaleIn overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-popover">
                    <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-3">
                        {loading ? (
                            <Loader2
                                size={16}
                                className="shrink-0 animate-spin text-neutral-400"
                            />
                        ) : (
                            <Search
                                size={16}
                                className="shrink-0 text-neutral-400"
                            />
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search trainees, batches, payments, and more…"
                            className="w-full border-0 bg-transparent text-sm text-ink outline-none placeholder:text-neutral-400"
                            data-cy="global-search-input"
                        />
                        <button
                            onClick={close}
                            aria-label="Close search"
                            className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100"
                            data-cy="global-search-button-close"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="lss-scrollbar max-h-[60vh] overflow-y-auto">
                        {!hasQuery && (
                            <p className="px-4 py-8 text-center text-xs text-neutral-400">
                                Type at least 2 characters to search.
                            </p>
                        )}

                        {hasQuery && !loading && totalResults === 0 && (
                            <p className="px-4 py-8 text-center text-xs text-neutral-400">
                                No results for "{query}".
                            </p>
                        )}

                        {groups.map((group) => (
                            <div key={group.key} className="py-2">
                                <p className="px-4 pb-1 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                                    {group.label}
                                </p>
                                {group.results.map((result) => (
                                    <button
                                        key={`${group.key}-${result.id}`}
                                        onClick={() =>
                                            handleSelect(result.url)
                                        }
                                        className="flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left transition-colors hover:bg-neutral-50"
                                        data-cy="global-search-result-button"
                                    >
                                        <span className="truncate text-sm font-medium text-ink">
                                            {result.label}
                                        </span>
                                        {result.subtitle && (
                                            <span className="truncate text-xs text-neutral-500">
                                                {result.subtitle}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2 text-[10px] text-neutral-400">
                        <span>Press Esc to close</span>
                        <span>Ctrl/Cmd + K to toggle</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
