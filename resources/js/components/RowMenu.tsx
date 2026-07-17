import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
export interface RowMenuActionConfig {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}
export type RowMenuAction = RowMenuActionConfig | null;
export function RowMenu({
  actions
}: {
  actions: RowMenuAction[];
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const menuWidth = 190;
      const left = Math.min(r.right - menuWidth, window.innerWidth - menuWidth - 8);
      setCoords({
        top: r.bottom + 6,
        left: Math.max(8, left)
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
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
  return <>
            <button ref={btnRef} type="button" onClick={e => {
      e.stopPropagation();
      setOpen(v => !v);
    }} aria-label="Row actions" aria-haspopup="menu" aria-expanded={open} className={cn('ml-auto flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 active:scale-95', open && 'bg-neutral-100 text-neutral-600')} data-cy="row-menu-button-row-actions">
                <MoreHorizontal size={16} data-cy="row-menu-more-horizontal-2" />
            </button>
            {open && createPortal(<div ref={menuRef} role="menu" style={{
      position: 'fixed',
      top: coords.top,
      left: coords.left,
      width: 190
    }} className="z-60 animate-scaleIn overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-popover" data-cy="row-menu-div-3">
                        {actions.map((a, idx) => {
        if (!a) return;
        return <button key={idx} role="menuitem" disabled={a.disabled} onClick={e => {
          e.stopPropagation();
          setOpen(false);
          a.onClick();
        }} className={cn('flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40', a.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-neutral-700 hover:bg-neutral-50')} data-cy="row-menu-button-4">
                                    <a.icon size={14} strokeWidth={2} className="shrink-0" data-cy="row-menu-a-icon-5" />
                                    {a.label}
                                </button>;
      })}
                    </div>, document.body)}
        </>;
}