import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import {
    ActionBadge,
    actorName,
    formatWhen,
    subjectType,
    type LogRow,
} from '@/types/modules/developer/system-log';

/**
 * Read-only detail view for one audit entry. Built on the shared <Modal> (same
 * primitive as CreateBatchModal / RecordModal) so it matches the app's modal
 * look. For create/update/delete it shows an old-vs-new field diff; for visits
 * it shows the visited route.
 */
export function LogDetailModal({
    log,
    onClose,
}: {
    log: LogRow;
    onClose: () => void;
}) {
    const changes = log.changes ?? {};
    const before = changes.old ?? {};
    const after = changes.new ?? {};
    const keys = Array.from(
        new Set([...Object.keys(before), ...Object.keys(after)]),
    );

    return (
        <Modal
            open
            onClose={onClose}
            maxWidth={640}
            title="Log details"
            description={log.description ?? undefined}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Meta label="Action">
                        <ActionBadge action={log.action} />
                    </Meta>
                    <Meta label="When">{formatWhen(log.created_at)}</Meta>
                    <Meta label="Subject">
                        {subjectType(log.loggable_type)}
                        {log.subject_label ? ` · ${log.subject_label}` : ''}
                    </Meta>
                    <Meta label="Actor">{actorName(log.actor)}</Meta>
                    <Meta label="Actor email">{log.actor?.email ?? '—'}</Meta>
                    <Meta label="Method · IP">
                        {[log.method, log.ip_address].filter(Boolean).join(' · ') ||
                            '—'}
                    </Meta>
                </div>

                {log.url && (
                    <Meta label="URL">
                        <span className="break-all">{log.url}</span>
                    </Meta>
                )}

                {log.action === 'visit' ? (
                    <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                        Page visit — {changes.route ?? 'unnamed route'}
                    </p>
                ) : keys.length > 0 ? (
                    <DiffTable keys={keys} before={before} after={after} />
                ) : (
                    <p className="text-xs text-neutral-500">
                        No field changes recorded.
                    </p>
                )}

                {log.user_agent && (
                    <Meta label="User agent">
                        <span className="break-all text-xs text-neutral-500">
                            {log.user_agent}
                        </span>
                    </Meta>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <p className="mb-0.5 text-xs font-medium text-neutral-500">{label}</p>
            <div className="text-sm text-ink">{children}</div>
        </div>
    );
}

function DiffTable({
    keys,
    before,
    after,
}: {
    keys: string[];
    before: Record<string, unknown>;
    after: Record<string, unknown>;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500">
                    <tr>
                        <th className="px-3 py-2 font-medium">Field</th>
                        <th className="px-3 py-2 font-medium">Old</th>
                        <th className="px-3 py-2 font-medium">New</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map((key) => (
                        <tr key={key} className="border-t border-neutral-100">
                            <td className="px-3 py-2 font-medium text-neutral-700">
                                {key}
                            </td>
                            <td className="px-3 py-2 text-danger-600">
                                {formatVal(before[key])}
                            </td>
                            <td className="px-3 py-2 text-success-600">
                                {formatVal(after[key])}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
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
