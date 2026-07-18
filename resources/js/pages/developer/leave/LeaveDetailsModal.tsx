import { ReactNode } from 'react';
import { CheckCircle2, Download, ExternalLink, FileText, XCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { cn } from '@/lib/utils';

export const LEAVE_STATUS_STYLE: Record<LeaveRequests['status'], string> = {
    pending: 'bg-warning-50 text-warning-800',
    approved: 'bg-success-50 text-success-800',
    declined: 'bg-danger-50 text-danger-800',
};

export const LEAVE_STATUS_LABEL: Record<LeaveRequests['status'], string> = {
    pending: 'Pending',
    approved: 'Approved',
    declined: 'Declined',
};

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <div className="text-[11px] font-medium text-neutral-500">
                {label}
            </div>
            <div className="mt-0.5 text-sm text-ink">{children}</div>
        </div>
    );
}

/** Inclusive day count between two ISO dates (YYYY-MM-DD or datetime). */
function leaveDayCount(leaveDate: string, returnDate: string): number {
    const start = new Date(leaveDate.slice(0, 10));
    const end = new Date(returnDate.slice(0, 10));
    const diffMs = end.getTime() - start.getTime();

    return Math.max(1, Math.round(diffMs / 86_400_000) + 1);
}

function formatDate(value: string | null): string {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

interface LeaveDetailsModalProps {
    record: LeaveRequests | null;
    onClose: () => void;
    onRequestApprove?: (record: LeaveRequests) => void;
    onRequestDecline?: (record: LeaveRequests) => void;
}

export function LeaveDetailsModal({
    record,
    onClose,
    onRequestApprove,
    onRequestDecline,
}: LeaveDetailsModalProps) {
    return (
        <Modal
            open={!!record}
            onClose={onClose}
            title="Leave request details"
            maxWidth={560}
        >
            {record && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                LEAVE_STATUS_STYLE[record.status],
                            )}
                        >
                            {LEAVE_STATUS_LABEL[record.status]}
                        </span>
                        <span className="text-xs text-neutral-400">
                            Submitted {formatDate(record.created_at)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md bg-neutral-50 p-3.5">
                        {record.trainee && (
                            <Field label="Trainee name">
                                {record.trainee.first_name}{' '}
                                {record.trainee.last_name}
                            </Field>
                        )}
                        {record.batch && (
                            <Field label="Batch">
                                {record.batch.batch_code}
                            </Field>
                        )}
                        <Field label="Leave type">
                            {record.leave_category?.name ?? '—'}
                        </Field>
                        <Field label="Leave date">
                            {formatDate(record.leave_date)}
                        </Field>
                        <Field label="Return date">
                            {formatDate(record.return_date)}
                        </Field>
                        <Field label="Number of leave days">
                            {leaveDayCount(record.leave_date, record.return_date)}{' '}
                            day
                            {leaveDayCount(record.leave_date, record.return_date) === 1
                                ? ''
                                : 's'}
                        </Field>
                    </div>

                    <div>
                        <div className="text-[11px] font-medium text-neutral-500">
                            Reason / remarks
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                            {record.reason}
                        </p>
                    </div>

                    <div>
                        <div className="mb-1.5 text-[11px] font-medium text-neutral-500">
                            Supporting document
                        </div>
                        {record.document_view_url ? (
                            <div className="flex items-center gap-2">
                                <a
                                    href={record.document_view_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
                                >
                                    <FileText size={13} className="shrink-0" />
                                    {record.document_original_name ??
                                        'View document'}
                                    <ExternalLink size={12} />
                                </a>
                                {record.document_download_url && (
                                    <a
                                        href={record.document_download_url}
                                        className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700"
                                    >
                                        <Download size={12} />
                                        Download
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400">
                                No supporting document attached.
                            </p>
                        )}
                    </div>

                    {record.status !== 'pending' && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-neutral-200 p-3.5">
                            <Field
                                label={
                                    record.status === 'approved'
                                        ? 'Approved by'
                                        : 'Declined by'
                                }
                            >
                                {record.decided_by
                                    ? `${record.decided_by.first_name} ${record.decided_by.last_name}`
                                    : '—'}
                            </Field>
                            <Field
                                label={
                                    record.status === 'approved'
                                        ? 'Approval date'
                                        : 'Decline date'
                                }
                            >
                                {formatDate(record.decided_at)}
                            </Field>
                            <div className="col-span-2">
                                <div className="text-[11px] font-medium text-neutral-500">
                                    {record.status === 'approved'
                                        ? 'Approval remarks (optional)'
                                        : 'Decline remarks'}
                                </div>
                                <p className="mt-0.5 text-sm text-neutral-700">
                                    {record.decision_remarks || '—'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-1 flex justify-end gap-2">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                        {record.status === 'pending' &&
                            onRequestApprove &&
                            onRequestDecline && (
                                <>
                                    <Button
                                        variant="danger"
                                        icon={XCircle}
                                        onClick={() =>
                                            onRequestDecline(record)
                                        }
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        variant="primary"
                                        icon={CheckCircle2}
                                        onClick={() =>
                                            onRequestApprove(record)
                                        }
                                    >
                                        Approve
                                    </Button>
                                </>
                            )}
                    </div>
                </div>
            )}
        </Modal>
    );
}
