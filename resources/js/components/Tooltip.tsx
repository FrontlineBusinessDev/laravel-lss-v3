import { useLayoutEffect, useRef, useState  } from 'react';
import type {ReactNode} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
    label: string;
    children: ReactNode;
    className?: string;
}

const EDGE_PADDING = 8;
const GAP = 8;

/**
 * Reusable hover/focus tooltip. Renders via createPortal into document.body
 * (fixed-positioned, computed from the trigger's own getBoundingClientRect)
 * instead of an absolutely-positioned sibling — so it's never clipped by an
 * ancestor's overflow:hidden/auto (e.g. a scrollable table row), which is
 * what happened with the old in-place tooltip near a table's right edge.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
    const triggerRef = useRef<HTMLSpanElement>(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<{
        top: number;
        left: number;
        placement: 'top' | 'bottom';
    } | null>(null);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) {
            return;
        }

        const rect = triggerRef.current.getBoundingClientRect();
        const placement: 'top' | 'bottom' =
            rect.top - GAP < 32 ? 'bottom' : 'top';
        const top = placement === 'top' ? rect.top - GAP : rect.bottom + GAP;
        const left = Math.min(
            Math.max(rect.left + rect.width / 2, EDGE_PADDING + 40),
            window.innerWidth - EDGE_PADDING - 40,
        );

        setPos({ top, left, placement });
    }, [open]);

    return (
        <span
            ref={triggerRef}
            className={cn('inline-flex', className)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
        >
            {children}
            {open &&
                pos &&
                createPortal(
                    <span
                        role="tooltip"
                        className={cn(
                            'pointer-events-none fixed z-[100] -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] font-medium text-white shadow-popover',
                            pos.placement === 'top' && '-translate-y-full',
                        )}
                        style={{ top: pos.top, left: pos.left }}
                    >
                        {label}
                    </span>,
                    document.body,
                )}
        </span>
    );
}
