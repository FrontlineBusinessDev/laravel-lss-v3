import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
type DropdownOption =
    | string
    | {
          label: string;
          value: string;
      };
interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
    fullWidthMenu?: boolean;
    /**
     * 'default' is the standard filter/select look (white, bordered, rounded-xl).
     * 'pill' is a compact tinted-pill look — use for a secondary/nested tab
     * selector stacked directly under a 'default' one (e.g. Settings > Academic's
     * sub-tabs under the primary Settings tabs), so the two are visually
     * distinguishable as different nesting levels rather than looking identical.
     */
    variant?: 'default' | 'pill';
}

/** Normalizes `string | {label,value}` options to a `{label,value}` pair. */
const toOption = (
    opt: DropdownOption,
): {
    label: string;
    value: string;
} =>
    typeof opt === 'string'
        ? {
              label: opt,
              value: opt,
          }
        : opt;
export function Dropdown({
    options,
    value,
    placeholder,
    onChange,
    className,
    variant = 'default',
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value ?? '');
    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
        width: 0,
    });
    const normalized = options.map(toOption);
    // Label shown on the trigger for the current value (falls back to placeholder
    // or the first option's label so the button is never blank).
    const selectedLabel =
        normalized.find((o) => o.value === selected)?.label ??
        placeholder ??
        normalized[0]?.label;
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (value !== undefined) setSelected(value);
    }, [value]);
    useEffect(() => {
        if (!open) return;
        const place = () => {
            const r = btnRef.current?.getBoundingClientRect();
            if (!r) return;
            setCoords({
                top: r.bottom + 6,
                left: r.left,
                width: r.width,
            });
        };
        place();
        const onDown = (e: MouseEvent) => {
            if (
                menuRef.current?.contains(e.target as Node) ||
                btnRef.current?.contains(e.target as Node)
            )
                return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && setOpen(false);
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center justify-between gap-2 font-medium transition-all duration-150 focus:ring-2 focus:outline-none',
                    variant === 'pill'
                        ? 'h-8 rounded-pill border border-brand-100 bg-brand-50 px-3 text-xs text-brand-700 hover:border-brand-200 focus:ring-brand-100'
                        : 'h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 shadow-card hover:border-neutral-300 hover:shadow-none focus:ring-brand-100',
                    open && 'border-brand-400 ring-2 ring-brand-100',
                    // Dim only when the value maps to no real option (placeholder
                    // state); a real empty-value option like "All Status" stays
                    // in normal ink.
                    !normalized.some((o) => o.value === selected) &&
                        variant !== 'pill' &&
                        'text-neutral-400',
                    className,
                )}
                data-cy="dropdown-button-button"
            >
                <span className="truncate" data-cy="dropdown-span-2">
                    {selectedLabel}
                </span>
                <ChevronDown
                    size={14}
                    className={cn(
                        'shrink-0 text-neutral-400 transition-transform duration-150',
                        open && 'rotate-180 text-brand-500',
                    )}
                    data-cy="dropdown-chevron-down-3"
                />
            </button>
            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="listbox"
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            minWidth: coords.width,
                        }}
                        className="lss-scrollbar z-60 max-h-64 animate-scaleIn overflow-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-popover"
                        data-cy="dropdown-div-4"
                    >
                        {normalized.map((opt) => (
                            <button
                                key={opt.value}
                                role="option"
                                aria-selected={selected === opt.value}
                                onClick={() => {
                                    setSelected(opt.value);
                                    onChange?.(opt.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-700',
                                    selected === opt.value &&
                                        'bg-brand-50 text-brand-700',
                                )}
                                data-cy="dropdown-button-set-selected"
                            >
                                <span
                                    className="truncate"
                                    data-cy="dropdown-span-6"
                                >
                                    {opt.label}
                                </span>
                                {selected === opt.value && (
                                    <Check
                                        size={13}
                                        className="shrink-0 text-brand-600"
                                        data-cy="dropdown-check-7"
                                    />
                                )}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}
