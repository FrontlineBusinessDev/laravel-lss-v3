import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FieldOption } from '@/types/reusable/fields';
import type { AsyncSelectFieldProps } from '@/types/reusable/fields-option';

/**
 * Compares a stored value against an option value. Primitives are matched by
 * string (so a numeric FK from an edit row equals its string option value);
 * objects fall back to a structural compare.
 */
function valuesEqual(a: unknown, b: unknown): boolean {
    if (a == null || b == null) {
        return a === b;
    }
    if (typeof a === 'object' || typeof b === 'object') {
        return JSON.stringify(a) === JSON.stringify(b);
    }
    return String(a) === String(b);
}
export function AsyncSelectField({
    value,
    onChange,
    loadOptions,
    getOptionLabel,
    initialLabel,
    placeholder = 'Search…',
    debounceMs = 300,
    minSearchLength = 0,
    disabled,
    error,
}: AsyncSelectFieldProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<FieldOption[]>([]);
    const [loading, setLoading] = useState(false);
    // Remembers the label of the current value so the trigger renders it even
    // when the value is a bare id (e.g. an edit row or a preselected filter).
    // Seeded from `initialLabel` when the caller can resolve it up-front (e.g.
    // from an eager-loaded relation), which also short-circuits the first-page
    // lookup scan below — the reliable path for archived / paged-out records.
    const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? '');
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestSeq = useRef(0);
    // Fixed-viewport coords for the body-portaled menu (escapes modal overflow).
    const [menuPos, setMenuPos] = useState<{
        left: number;
        width: number;
        top?: number;
        bottom?: number;
    }>({
        left: 0,
        width: 0,
        top: 0,
    });

    // Anchor to the trigger rect; flip upward when there's no room below.
    const updatePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) {
            return;
        }
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 300 && rect.top > spaceBelow;
        setMenuPos({
            left: rect.left,
            width: rect.width,
            ...(openUp
                ? {
                      bottom: window.innerHeight - rect.top + 4,
                  }
                : {
                      top: rect.bottom + 4,
                  }),
        });
    }, []);
    const currentLabel = !value
        ? ''
        : getOptionLabel
          ? getOptionLabel(value)
          : selectedLabel ||
            String(
                (
                    value as {
                        name?: string;
                    }
                )?.name ?? '',
            );

    // Resolve the label for a preset value once (edit mode / preselected
    // filter). Skipped when the caller supplies its own getOptionLabel or the
    // label is already known from a user selection.
    useEffect(() => {
        if (!value || selectedLabel || getOptionLabel) {
            return;
        }
        let active = true;
        loadOptions('')
            .then((results) => {
                const match = results.find((o) => valuesEqual(o.value, value));
                if (active && match) {
                    setSelectedLabel(match.label);
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    const runSearch = useCallback(
        (q: string) => {
            if (q.length < minSearchLength) {
                setOptions([]);
                return;
            }
            const seq = ++requestSeq.current;
            setLoading(true);
            loadOptions(q)
                .then((results) => {
                    // ignore stale responses if a newer search has started
                    if (seq === requestSeq.current) {
                        setOptions(results);
                    }
                })
                .catch(() => {
                    if (seq === requestSeq.current) {
                        setOptions([]);
                    }
                })
                .finally(() => {
                    if (seq === requestSeq.current) {
                        setLoading(false);
                    }
                });
        },
        [loadOptions, minSearchLength],
    );

    // Load the first page immediately when the menu opens — a single request so
    // the options are ready on open (no load-then-reload double fetch).
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            runSearch(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Debounced re-search as the user edits the query. Intentionally NOT keyed
    // on `open`, so merely opening the menu doesn't fire a second request on top
    // of the initial load above — only actual keystrokes trigger a search.
    useEffect(() => {
        if (!open) {
            return;
        }
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => runSearch(query), debounceMs);
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    // Keep the portaled menu pinned to the trigger while open (scroll/resize).
    useEffect(() => {
        if (!open) {
            return;
        }
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, updatePosition]);

    // close on outside click — also check menuRef since the menu is portaled.
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                !containerRef.current?.contains(target) &&
                !menuRef.current?.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);
    return (
        <div
            ref={containerRef}
            className="relative"
            data-cy="use-async-select-field-div-1 "
        >
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!open) {
                        updatePosition();
                    }
                    setOpen((o) => !o);
                }}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-sm ${error ? 'border-rose-300' : 'border-slate-200'} ${disabled ? 'cursor-not-allowed bg-slate-50/20' : 'text-slate-900 hover:border-slate-300'} dark:text-white`}
                data-cy="use-async-select-field-button-button"
            >
                <span
                    className={`text-black ${currentLabel ? '' : ''}`}
                    data-cy="use-async-select-field-span-3"
                >
                    {currentLabel || placeholder}
                </span>
                <ChevronDown
                    className="h-4 w-4"
                    data-cy="use-async-select-field-chevron-down-4"
                />
            </button>

            {open &&
                !disabled &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            left: menuPos.left,
                            width: menuPos.width,
                            top: menuPos.top,
                            bottom: menuPos.bottom,
                            zIndex: 60,
                        }}
                        className="dark:bg-sidebar rounded-xl border border-slate-200 bg-white shadow-lg"
                        data-cy="use-async-select-field-div-5"
                    >
                        <div
                            className="border-b border-slate-100 p-2"
                            data-cy="use-async-select-field-div-6"
                        >
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={placeholder}
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-neutral-900 focus:border-slate-400 focus:outline-none"
                                data-cy="use-async-select-field-input-placeholder"
                            />
                        </div>
                        <div
                            className="max-h-56 overflow-y-auto py-1"
                            data-cy="use-async-select-field-div-8"
                        >
                            {loading && (
                                <div
                                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm"
                                    data-cy="use-async-select-field-div-searching"
                                >
                                    <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                        data-cy="use-async-select-field-loader2-10"
                                    />
                                    Searching…
                                </div>
                            )}
                            {!loading && options.length === 0 && (
                                <div
                                    className="px-3 py-3 text-sm"
                                    data-cy="use-async-select-field-div-no-results"
                                >
                                    No results.
                                </div>
                            )}
                            {!loading &&
                                options.map((opt) => {
                                    const isSelected = valuesEqual(
                                        opt.value,
                                        value,
                                    );
                                    return (
                                        <button
                                            key={JSON.stringify(opt.value)}
                                            type="button"
                                            onClick={() => {
                                                onChange(opt.value);
                                                setSelectedLabel(opt.label);
                                                setOpen(false);
                                                setQuery('');
                                            }}
                                            className="hover:brand-400/10 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                                            data-cy="use-async-select-field-button-button-2"
                                        >
                                            {opt.label}
                                            {isSelected && (
                                                <Check
                                                    className="h-3.5 w-3.5 text-slate-900"
                                                    data-cy="use-async-select-field-check-13"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
