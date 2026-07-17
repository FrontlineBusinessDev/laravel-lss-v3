// ---------------------------------------------------------------------------
// Shared admin-table cells
//
// Presentational building blocks shared by the Clients / Assignee / Ticket
// History tables so their row renderers stay thin and consistent. Paired with
// DataTableField's "table mode" (the `listHeader` prop), which wraps the rows in
// a single rounded shell with a matching header row.
// ---------------------------------------------------------------------------

import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { avatarBg, initialsOf } from '@/pages/developer/dashboard/shared';
import type { CardActions } from '@/types/reusable/card';

/** Colored initials avatar (deterministic gradient from the name). */
export function TableAvatar({
  name,
  className = 'h-10 w-10 text-xs'
}: {
  name: string;
  className?: string;
}) {
  return <span className={`inline-flex ${className} shrink-0 items-center justify-center rounded-full font-semibold text-white`} style={{
    background: avatarBg(name)
  }} aria-hidden data-cy="cells-span-1">
            {initialsOf(name)}
        </span>;
}
const STATUS_STYLES: Record<string, {
  pill: string;
  dot: string;
}> = {
  active: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500'
  },
  invited: {
    pill: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500'
  },
  inactive: {
    pill: 'bg-rose-50 text-rose-600',
    dot: 'bg-rose-500'
  }
};

/** Small status pill with a leading dot (Active / Invited / Inactive). */
export function StatusPill({
  status,
  label
}: {
  status: string;
  label?: string;
}) {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.inactive;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style.pill}`} data-cy="cells-span-2">
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} data-cy="cells-span-3" />
            {label ?? status}
        </span>;
}

/**
 * Column-header row for a table-mode DataTableField. `gridClassName` MUST match
 * the row renderer's grid so the header labels line up with the cells beneath.
 */
export function AdminTableHeader({
  gridClassName,
  children
}: {
  gridClassName: string;
  children: ReactNode;
}) {
  return <div className={`${gridClassName} border-b border-gray-100 bg-slate-50/60 py-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase`} data-cy="cells-div-4">
            {children}
        </div>;
}
function IconButton({
  children,
  title,
  onClick,
  tone,
  disabled
}: {
  children: ReactNode;
  title: string;
  onClick?: () => void;
  tone?: 'danger';
  disabled?: boolean;
}) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`inline-flex size-8 items-center justify-center rounded-lg border border-[#ecedf1] bg-white text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tone === 'danger' ? 'hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-50 hover:text-slate-700'}`} data-cy="cells-button-title">
            {children}
        </button>;
}

/**
 * Row action buttons — preserves the existing two-step business rule exactly,
 * just restyled to the mockup's bordered-icon look: an ACTIVE row offers Edit +
 * Archive; an archived (inactive) row offers Restore + Delete (delete stays
 * gated on "archive first" server-side). Nothing about the flow changes.
 */
export function RowActions({
  status,
  actions
}: {
  status: string;
  actions: CardActions;
}) {
  const isActive = status === 'active';
  return <div className="flex items-center justify-end gap-1.5" data-cy="cells-div-6">
            {isActive ? <>
                    {actions.canEdit && <IconButton title="Edit" onClick={actions.onEdit} data-cy="cells-icon-button-edit">
                            <Pencil className="size-4" data-cy="cells-pencil-8" />
                        </IconButton>}
                    {actions.canArchive && <IconButton title="Archive" onClick={actions.onArchive} disabled={actions.archiving} data-cy="cells-icon-button-archive">
                            <Archive className="size-4" data-cy="cells-archive-10" />
                        </IconButton>}
                </> : <>
                    {actions.canArchive && <IconButton title="Restore" onClick={actions.onRestore} disabled={actions.restoring} data-cy="cells-icon-button-restore">
                            <ArchiveRestore className="size-4" data-cy="cells-archive-restore-12" />
                        </IconButton>}
                    {actions.canDelete && <IconButton title="Delete" tone="danger" onClick={actions.onDelete} data-cy="cells-icon-button-delete">
                            <Trash2 className="size-4" data-cy="cells-trash2-14" />
                        </IconButton>}
                </>}
        </div>;
}