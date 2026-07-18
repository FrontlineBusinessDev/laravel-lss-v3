import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import type { StatusKind } from '@/types';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { trainerColumns } from '@/types/modules/leave/leave-requests';

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    approved: 'active',
    declined: 'declined',
};

const columns = trainerColumns.map((col) =>
    col.key === 'status'
        ? {
              ...col,
              render: (value: unknown) => (
                  <StatusBadge
                      status={STATUS_BADGE[value as string] ?? 'pending'}
                  />
              ),
          }
        : col,
);

const renderRow = (row: LeaveRequests) => {
    const badge: StatusKind = STATUS_BADGE[row.status] ?? 'pending';

    return (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                        {row.batch?.batch_code ?? '—'}
                    </dd>
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
        </div>
    );
};

/**
 * Read-only "who's on leave" feed. Trainers hold neither `manage leave` nor
 * `manage own leave` — LeaveRequestPolicy grants them view-only access
 * specifically so this page can show visibility without submit/approve
 * actions or the email notifications admins get. `renderCard` replaces the
 * default card so no archive/restore/delete affordances (which the backend
 * has no routes for on /leave, and trainers aren't authorized for anyway)
 * are shown.
 */
export default function TrainerLeavePage() {
    return (
        <TrainerLayout title="Leave">
            <DataTableCardField<LeaveRequests>
                apiUrl="/leave"
                apiQueryKey="leave-requests-trainer"
                columns={columns}
                defaultSortBy="leave_date"
                defaultSortDir="desc"
                renderCard={renderRow}
            />
        </TrainerLayout>
    );
}
