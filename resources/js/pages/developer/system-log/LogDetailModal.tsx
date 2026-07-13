import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { ActionBadge, actorName, formatWhen, subjectType, type LogRow } from '@/types/modules/developer/system-log';

/**
 * Read-only detail view for one audit entry. Built on the shared <Modal> (same
 * primitive as CreateBatchModal / RecordModal) so it matches the app's modal
 * look. For create/update/delete it shows an old-vs-new field diff; for visits
 * it shows the visited route.
 */
export function LogDetailModal({
  log,
  onClose
}: {
  log: LogRow;
  onClose: () => void;
}) {
  const changes = log.changes ?? {};
  const before = changes.old ?? {};
  const after = changes.new ?? {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return <Modal open onClose={onClose} maxWidth={640} title="Log details" description={log.description ?? undefined} data-cy="log-detail-modal-modal-log-details">
            <div className="space-y-4" data-cy="log-detail-modal-div-2">
                <div className="grid grid-cols-2 gap-3" data-cy="log-detail-modal-div-3">
                    <Meta label="Action" data-cy="log-detail-modal-meta-action">
                        <ActionBadge action={log.action} data-cy="log-detail-modal-action-badge-5" />
                    </Meta>
                    <Meta label="When" data-cy="log-detail-modal-meta-when">{formatWhen(log.created_at)}</Meta>
                    <Meta label="Subject" data-cy="log-detail-modal-meta-subject">
                        {subjectType(log.loggable_type)}
                        {log.subject_label ? ` · ${log.subject_label}` : ''}
                    </Meta>
                    <Meta label="Actor" data-cy="log-detail-modal-meta-actor">{actorName(log.actor)}</Meta>
                    <Meta label="Actor email" data-cy="log-detail-modal-meta-actor-email">{log.actor?.email ?? '—'}</Meta>
                    <Meta label="Method · IP" data-cy="log-detail-modal-meta-10">
                        {[log.method, log.ip_address].filter(Boolean).join(' · ') || '—'}
                    </Meta>
                </div>

                {log.url && <Meta label="URL" data-cy="log-detail-modal-meta-url">
                        <span className="break-all" data-cy="log-detail-modal-span-12">{log.url}</span>
                    </Meta>}

                {log.action === 'visit' ? <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-500" data-cy="log-detail-modal-p-page-visit">
                        Page visit — {changes.route ?? 'unnamed route'}
                    </p> : keys.length > 0 ? <DiffTable keys={keys} before={before} after={after} data-cy="log-detail-modal-diff-table-14" /> : <p className="text-xs text-neutral-500" data-cy="log-detail-modal-p-no-field-changes-recorded">
                        No field changes recorded.
                    </p>}

                {log.user_agent && <Meta label="User agent" data-cy="log-detail-modal-meta-user-agent">
                        <span className="break-all text-xs text-neutral-500" data-cy="log-detail-modal-span-17">
                            {log.user_agent}
                        </span>
                    </Meta>}

                <div className="flex justify-end pt-2" data-cy="log-detail-modal-div-18">
                    <button type="button" onClick={onClose} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50" data-cy="log-detail-modal-button-button">
                        Close
                    </button>
                </div>
            </div>
        </Modal>;
}
function Meta({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return <div data-cy="log-detail-modal-div-20">
            <p className="mb-0.5 text-xs font-medium text-neutral-500" data-cy="log-detail-modal-p-21">{label}</p>
            <div className="text-sm text-ink" data-cy="log-detail-modal-div-22">{children}</div>
        </div>;
}
function DiffTable({
  keys,
  before,
  after
}: {
  keys: string[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) {
  return <div className="overflow-x-auto rounded-lg border border-neutral-200" data-cy="log-detail-modal-div-23">
            <table className="w-full text-left text-xs" data-cy="log-detail-modal-table-24">
                <thead className="bg-neutral-50 text-neutral-500" data-cy="log-detail-modal-thead-25">
                    <tr data-cy="log-detail-modal-tr-26">
                        <th className="px-3 py-2 font-medium" data-cy="log-detail-modal-th-field">Field</th>
                        <th className="px-3 py-2 font-medium" data-cy="log-detail-modal-th-old">Old</th>
                        <th className="px-3 py-2 font-medium" data-cy="log-detail-modal-th-new">New</th>
                    </tr>
                </thead>
                <tbody data-cy="log-detail-modal-tbody-30">
                    {keys.map(key => <tr key={key} className="border-t border-neutral-100" data-cy="log-detail-modal-tr-31">
                            <td className="px-3 py-2 font-medium text-neutral-700" data-cy="log-detail-modal-td-32">
                                {key}
                            </td>
                            <td className="px-3 py-2 text-danger-600" data-cy="log-detail-modal-td-33">
                                {formatVal(before[key])}
                            </td>
                            <td className="px-3 py-2 text-success-600" data-cy="log-detail-modal-td-34">
                                {formatVal(after[key])}
                            </td>
                        </tr>)}
                </tbody>
            </table>
        </div>;
}
function formatVal(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}