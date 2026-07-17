import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FieldOption } from '@/types/reusable/fields';

export interface AsyncMultiSelectFieldProps {
    value: string[];
    onChange: (value: string[]) => void;
    loadOptions: (query: string) => Promise<FieldOption[]>;
    placeholder?: string;
    debounceMs?: number;
    minSearchLength?: number;
    disabled?: boolean;
    error?: string;
    /** Show a "Select all" toggle over the currently-loaded options. Default true. */
    enableSelectAll?: boolean;
}

/**
 * Multi-select counterpart to AsyncSelectField (use-async-select-field.tsx) —
 * same debounce/portal/positioning behavior, but the menu stays open across
 * selections and `value`/`onChange` deal in string arrays.
 */
export function AsyncMultiSelectField({
    value,
    onChange,
    loadOptions,
    placeholder = 'All',
    debounceMs = 300,
    minSearchLength = 0,
    disabled,
    error,
    enableSelectAll = true,
}: AsyncMultiSelectFieldProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<FieldOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [labelsById, setLabelsById] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestSeq = useRef(0);
    const [menuPos, setMenuPos] = useState<{
        left: number;
        width: number;
        top?: number;
        bottom?: number;
    }>({ left: 0, width: 0, top: 0 });

    const updatePosition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 300 && rect.top > spaceBelow;
        setMenuPos({
            left: rect.left,
            width: rect.width,
            ...(openUp
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 }),
        });
    }, []);

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
                    if (seq === requestSeq.current) {
                        setOptions(results);
                        setLabelsById((prev) => {
                            const next = { ...prev };
                            results.forEach((o) => {
                                next[o.value] = o.label;
                            });
                            return next;
                        });
                    }
                })
                .catch(() => {
                    if (seq === requestSeq.current) setOptions([]);
                })
                .finally(() => {
                    if (seq === requestSeq.current) setLoading(false);
                });
        },
        [loadOptions, minSearchLength],
    );

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            runSearch(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => runSearch(query), debounceMs);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    useEffect(() => {
        if (!open) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, updatePosition]);

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

    function toggle(v: string) {
        onChange(
            value.includes(v) ? value.filter((x) => x !== v) : [...value, v],
        );
    }
    function toggleAll() {
        const allSelected =
            options.length > 0 && options.every((o) => value.includes(o.value));
        if (allSelected) {
            onChange(value.filter((v) => !options.some((o) => o.value === v)));
        } else {
            const merged = new Set([...value, ...options.map((o) => o.value)]);
            onChange([...merged]);
        }
    }

    const triggerLabel =
        value.length === 0
            ? placeholder
            : value.length === 1
              ? (labelsById[value[0]] ?? placeholder)
              : `${value.length} selected`;

    return (
        <div
            ref={containerRef}
            className="relative"
            data-cy="use-async-multi-select-field-div-1"
        >
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!open) updatePosition();
                    setOpen((o) => !o);
                }}
                className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-sm ${error ? 'border-rose-300' : 'border-slate-200'} ${disabled ? 'cursor-not-allowed bg-slate-50/20' : 'text-slate-900 hover:border-slate-300'} dark:text-white`}
                data-cy="use-async-multi-select-field-button-button"
            >
                <span
                    className="text-black"
                    data-cy="use-async-multi-select-field-span-3"
                >
                    {triggerLabel}
                </span>
                <ChevronDown
                    className="h-4 w-4"
                    data-cy="use-async-multi-select-field-chevron-down-4"
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
                        data-cy="use-async-multi-select-field-div-5"
                    >
                        <div
                            className="border-b border-slate-100 p-2"
                            data-cy="use-async-multi-select-field-div-6"
                        >
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-neutral-900 focus:border-slate-400 focus:outline-none"
                                data-cy="use-async-multi-select-field-input-search"
                            />
                        </div>
                        <div
                            className="max-h-56 overflow-y-auto py-1"
                            data-cy="use-async-multi-select-field-div-8"
                        >
                            {loading && (
                                <div
                                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm"
                                    data-cy="use-async-multi-select-field-div-searching"
                                >
                                    <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                        data-cy="use-async-multi-select-field-loader2-10"
                                    />
                                    Searching…
                                </div>
                            )}
                            {!loading && options.length === 0 && (
                                <div
                                    className="px-3 py-3 text-sm"
                                    data-cy="use-async-multi-select-field-div-no-results"
                                >
                                    No results.
                                </div>
                            )}
                            {!loading &&
                                enableSelectAll &&
                                options.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="hover:brand-400/10 flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm font-medium"
                                        data-cy="use-async-multi-select-field-button-select-all"
                                    >
                                        Select all
                                        {options.length > 0 &&
                                            options.every((o) =>
                                                value.includes(o.value),
                                            ) && (
                                                <Check
                                                    className="h-3.5 w-3.5 text-slate-900"
                                                    data-cy="use-async-multi-select-field-check-all"
                                                />
                                            )}
                                    </button>
                                )}
                            {!loading &&
                                options.map((opt) => {
                                    const isSelected = value.includes(
                                        opt.value,
                                    );
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => toggle(opt.value)}
                                            className="hover:brand-400/10 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                                            data-cy="use-async-multi-select-field-button-button-2"
                                        >
                                            {opt.label}
                                            {isSelected && (
                                                <Check
                                                    className="h-3.5 w-3.5 text-slate-900"
                                                    data-cy="use-async-multi-select-field-check-13"
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
