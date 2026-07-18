import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/table/DataTable';
import { formatCell } from '@/components/table/utils';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import type { StatusKind } from '@/types';
import type { ColumnDef } from '@/types/reusable/data-table';
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

const renderRow = (row: LeaveRequests) => (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
        {columns.map((col: ColumnDef<LeaveRequests>) => (
            <td key={col.key} className="px-4 py-3 text-sm">
                {col.render ? col.render(row[col.key], row) : formatCell(row[col.key])}
            </td>
        ))}
        <td className="px-4 py-3" />
    </tr>
);

/**
 * Read-only "who's on leave" feed. Trainers hold neither `manage leave` nor
 * `manage own leave` — LeaveRequestPolicy grants them view-only access
 * specifically so this page can show visibility without submit/approve
 * actions or the email notifications admins get. `renderCard` replaces
 * DataTable's default row so no archive/restore/delete affordances (which
 * the backend has no routes for on /leave, and trainers aren't authorized
 * for anyway) are shown.
 */
export default function TrainerLeavePage() {
    return (
        <TrainerLayout title="Leave">
            <DataTable<LeaveRequests>
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
