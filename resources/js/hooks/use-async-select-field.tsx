import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldOption } from '@/types/reusable/fields';
import type { AsyncSelectFieldProps } from '@/types/reusable/fields-option';

export function AsyncSelectField({
    value,
    onChange,
    loadOptions,
    getOptionLabel,
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
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestSeq = useRef(0);

    const currentLabel = value
        ? getOptionLabel
            ? getOptionLabel(value)
            : String((value as { name?: string })?.name ?? '')
        : '';

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
    }, [query, open, debounceMs]);

    // load an initial batch when first opened with empty query
    useEffect(() => {
        if (open && query === '' && options.length === 0 && !loading) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            runSearch('');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // close on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);

        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    setOpen((o) => !o);
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                    error ? 'border-rose-300' : 'border-slate-200'
                } ${disabled ? 'cursor-not-allowed bg-slate-50/20' : 'text-slate-900 hover:border-slate-300'} dark:text-white`}
            >
                <span className={currentLabel ? '' : ''}>
                    {currentLabel || placeholder}
                </span>
                <ChevronDown className="h-4 w-4" />
            </button>

            {open && !disabled && (
                <div className="dark:bg-sidebar absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 p-2">
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-slate-400 focus:outline-none dark:text-white"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                        {loading && (
                            <div className="flex items-center justify-center gap-2 px-3 py-3 text-sm">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Searching…
                            </div>
                        )}
                        {!loading && options.length === 0 && (
                            <div className="px-3 py-3 text-sm">No results.</div>
                        )}
                        {!loading &&
                            options.map((opt) => {
                                const isSelected =
                                    JSON.stringify(opt.value) ===
                                    JSON.stringify(value);

                                return (
                                    <button
                                        key={JSON.stringify(opt.value)}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                        className="hover:brand-400/10 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                                    >
                                        {opt.label}
                                        {isSelected && (
                                            <Check className="h-3.5 w-3.5 text-slate-900" />
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}
