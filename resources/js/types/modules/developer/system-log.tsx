import type { ColumnDef } from '@/types/reusable/data-table';

/** Disconnected actor snapshot stored on each log row (never an FK). */
export interface LogActor {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

/** Shape of the JSON `changes` payload — varies by action. */
export interface LogChanges {
  old?: Record<string, unknown>;
  new?: Record<string, unknown>;
  url?: string;
  route?: string | null;
}
export interface LogRow extends Record<string, unknown> {
  id: number;
  action: string;
  loggable_type: string | null;
  loggable_id: number | null;
  subject_label: string | null;
  actor_id: number | null;
  actor: LogActor | null;
  changes: LogChanges | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  method: string | null;
  created_at: string;
}

/** Filter dropdown pairs for the Action column (leading "All" reset). */
export const ACTION_FILTER_PAIRS = [{
  value: '',
  label: 'All Actions'
}, {
  value: 'create',
  label: 'Create'
}, {
  value: 'update',
  label: 'Update'
}, {
  value: 'delete',
  label: 'Delete'
}, {
  value: 'archive',
  label: 'Archive'
}, {
  value: 'restore',
  label: 'Restore'
}, {
  value: 'visit',
  label: 'Visit'
}];
export const columns: ColumnDef<LogRow>[] = [{
  key: 'created_at',
  label: 'When',
  sortable: true
}, {
  key: 'action',
  label: 'Action',
  type: 'select',
  searchable: true,
  filterable: true,
  typeData: ACTION_FILTER_PAIRS,
  exactFilters: true
}, {
  key: 'subject_label',
  label: 'Subject',
  searchable: true
}, {
  key: 'description',
  label: 'Description',
  searchable: true
}, {
  key: 'url',
  label: 'URL',
  searchable: true
}];

/** Tailwind pill classes per action, using only defined theme tokens. */
const ACTION_STYLES: Record<string, string> = {
  create: 'bg-success-50 text-success-600',
  update: 'bg-info-50 text-info-600',
  archive: 'bg-warning-50 text-warning-600',
  restore: 'bg-brand-50 text-brand-600',
  delete: 'bg-danger-50 text-danger-600',
  visit: 'bg-neutral-100 text-neutral-600'
};
export function ActionBadge({
  action
}: {
  action: string;
}) {
  const cls = ACTION_STYLES[action] ?? 'bg-neutral-100 text-neutral-600';
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`} data-cy="system-log-span-1">
            {action}
        </span>;
}

/** "First Last", falling back to email, then a "System" placeholder for guests. */
export function actorName(actor: LogActor | null): string {
  if (actor === null) {
    return 'System / Guest';
  }
  const full = [actor.first_name, actor.last_name].filter(Boolean).join(' ').trim();
  return full !== '' ? full : actor.email ?? `User #${actor.id}`;
}

/** Human class name for a loggable_type (App\Models\Batches -> Batches). */
export function subjectType(loggableType: string | null): string {
  if (!loggableType) {
    return '—';
  }
  const parts = loggableType.split('\\');
  return parts[parts.length - 1];
}

/** Compact, locale-aware timestamp for the When column. */
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}