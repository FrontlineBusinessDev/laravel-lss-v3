import { leaveRequestService } from '@/api-service-layer/leave-request';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableCardField from '@/components/table/DataTableCardField';
import { useToast } from '@/hooks/use-toast';
import type { StatusKind } from '@/types';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { columns } from '@/types/modules/leave/leave-requests';
import { CheckCircle2, Eye, Trash2, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { LeaveDetailsModal } from './LeaveDetailsModal';

const PERMISSION = 'manage leave';

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    approved: 'active',
    declined: 'declined',
};

export default function LeaveManagementPage() {
    const { toast } = useToast();
    const refreshRef = useRef<(() => void) | null>(null);
    const [declineTarget, setDeclineTarget] = useState<LeaveRequests | null>(
        null,
    );
    const [decisionRemarks, setDecisionRemarks] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);
    const [detailsTarget, setDetailsTarget] = useState<LeaveRequests | null>(
        null,
    );

    const refresh = () => refreshRef.current?.();

    async function approve(row: LeaveRequests) {
        setBusyId(row.id);
        try {
            await leaveRequestService.approve(row.id);
            toast({ title: 'Leave request approved', variant: 'success' });
            refresh();
        } catch (err) {
            toast({
                title: 'Approve failed',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        } finally {
            setBusyId(null);
        }
    }

    async function confirmDecline() {
        if (!declineTarget) return;
        setBusyId(declineTarget.id);
        try {
            await leaveRequestService.decline(
                declineTarget.id,
                decisionRemarks,
            );
            toast({ title: 'Leave request declined', variant: 'info' });
            setDeclineTarget(null);
            setDecisionRemarks('');
            refresh();
        } catch (err) {
            toast({
                title: 'Decline failed',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        } finally {
            setBusyId(null);
        }
    }

    const renderRow = (row: LeaveRequests) => {
        const badge: StatusKind = STATUS_BADGE[row.status] ?? 'pending';
        const busy = busyId === row.id;

        return (
            <div className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold">
                            {row.trainee
                                ? `${row.trainee.first_name} ${row.trainee.last_name}`
                                : '—'}
                        </h3>
                        <StatusBadge status={badge} />
                    </div>
                    <dl className="mt-1 space-y-0.5">
                        <dd className="truncate text-sm">
                            {row.leave_category?.name ?? '—'}
                        </dd>
                        <dd className="truncate text-sm">
                            {row.leave_date.slice(0, 10)} –{' '}
                            {row.return_date.slice(0, 10)}
                        </dd>
                        <dd className="truncate text-sm">{row.reason}</dd>
                    </dl>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setDetailsTarget(row)}
                        title="View details"
                        className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
                    >
                        <Eye className="size-4" />
                    </button>
                    {row.status === 'pending' && (
                        <>
                            <button
                                type="button"
                                onClick={() => void approve(row)}
                                disabled={busy}
                                title="Approve"
                                className="rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                            >
                                <CheckCircle2 className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeclineTarget(row)}
                                disabled={busy}
                                title="Decline"
                                className="rounded-md p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                            >
                                <XCircle className="size-4" />
                            </button>
                        </>
                    )}
                    {row.status !== 'approved' && (
                        <button
                            type="button"
                            onClick={async () => {
                                setBusyId(row.id);
                                try {
                                    await leaveRequestService.delete(row.id);
                                    toast({
                                        title: 'Leave request deleted',
                                        variant: 'success',
                                    });
                                    refresh();
                                } finally {
                                    setBusyId(null);
                                }
                            }}
                            disabled={busy}
                            title="Delete"
                            className="rounded-md p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-ink">
                    Leave Management
                </h1>
                <p className="text-sm text-neutral-500">
                    Review, approve, or decline trainee leave applications.
                </p>
            </div>

            <DataTableCardField<LeaveRequests>
                apiUrl="/leave"
                apiQueryKey="leave-requests"
                columns={columns}
                defaultSortBy="leave_date"
                defaultSortDir="desc"
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                renderCard={renderRow}
                onRefreshRef={(fn) => (refreshRef.current = fn)}
            />

            <Modal
                open={declineTarget !== null}
                onClose={() => !busyId && setDeclineTarget(null)}
                title="Decline leave request"
                description={
                    declineTarget
                        ? `Decline ${declineTarget.trainee?.first_name ?? ''} ${declineTarget.trainee?.last_name ?? ''}'s leave request?`
                        : undefined
                }
            >
                <TextAreaRemarks
                    value={decisionRemarks}
                    onChange={setDecisionRemarks}
                />
                <div className="mt-2 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setDeclineTarget(null)}
                        disabled={busyId !== null}
                        className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => void confirmDecline()}
                        disabled={busyId !== null}
                        className="rounded-md bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600/90 disabled:opacity-60"
                    >
                        {busyId !== null ? 'Declining…' : 'Decline'}
                    </button>
                </div>
            </Modal>

            <LeaveDetailsModal
                record={detailsTarget}
                onClose={() => setDetailsTarget(null)}
                onRequestApprove={(record) => {
                    setDetailsTarget(null);
                    void approve(record);
                }}
                onRequestDecline={(record) => {
                    setDetailsTarget(null);
                    setDeclineTarget(record);
                }}
            />
        </div>
    );
}

function TextAreaRemarks({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Remarks (optional)
            </label>
            <textarea
                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Reason for declining…"
            />
        </div>
    );
}
