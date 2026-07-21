import { ChevronDown, ChevronRight, Users2, CheckCircle2, UserX } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { ReportBatch } from '@/api-service-layer/developer/report';
import { formatCurrency } from '../reportsUtils';

interface AnnualBatchCardProps {
  batch: ReportBatch;
  isOpen: boolean;
  onToggle: () => void;
}

export function AnnualBatchCard({ batch, isOpen, onToggle }: AnnualBatchCardProps) {
  const list = batch.trainees;
  const fin = batch.financials;

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="annual-batch-card-div-1">
      <button onClick={onToggle} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50" data-cy="annual-batch-card-button-toggle">
        {isOpen ? <ChevronDown size={16} className="shrink-0 text-neutral-400" data-cy="annual-batch-card-chevron-down" /> : <ChevronRight size={16} className="shrink-0 text-neutral-400" data-cy="annual-batch-card-chevron-right" />}
        <div className="min-w-[140px]" data-cy="annual-batch-card-div-2">
          <div className="font-mono text-xs font-semibold text-ink" data-cy="annual-batch-card-div-3">{batch.batchNo}</div>
          <div className="text-xs text-neutral-500" data-cy="annual-batch-card-div-4">{batch.programType}</div>
        </div>
        <StatusBadge status={batch.status} data-cy="annual-batch-card-status-badge" />
        <div className="text-xs text-neutral-500" data-cy="annual-batch-card-div-5">
          {batch.started} &ndash; {batch.projectedEnd}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-600" data-cy="annual-batch-card-div-trainee">
          <Users2 size={13} className="text-neutral-400" data-cy="annual-batch-card-users2" /> {list.length} trainee{list.length === 1 ? '' : 's'}
        </div>
        {fin.completedCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-success-700" data-cy="annual-batch-card-div-completed">
            <CheckCircle2 size={13} data-cy="annual-batch-card-check-circle2" /> {fin.completedCount} completed
          </div>
        )}
        {fin.terminatedCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-danger-700" data-cy="annual-batch-card-div-terminated">
            <UserX size={13} data-cy="annual-batch-card-user-x" /> {fin.terminatedCount} terminated
          </div>
        )}
        <div className="ml-auto flex gap-5 text-right" data-cy="annual-batch-card-div-6">
          <div data-cy="annual-batch-card-div-7">
            <div className="text-[10px] text-neutral-400" data-cy="annual-batch-card-div-received">Received</div>
            <div className="text-xs font-semibold text-ink" data-cy="annual-batch-card-div-8">{formatCurrency(fin.totalReceived)}</div>
          </div>
          <div data-cy="annual-batch-card-div-9">
            <div className="text-[10px] text-neutral-400" data-cy="annual-batch-card-div-balance">Balance</div>
            <div className={cn('text-xs font-semibold', fin.totalBalance > 0 ? 'text-warning-700' : 'text-ink')} data-cy="annual-batch-card-div-10">
              {formatCurrency(fin.totalBalance)}
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-neutral-100 lss-scrollbar" data-cy="annual-batch-card-div-11">
          <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="annual-batch-card-table-1">
            <thead data-cy="annual-batch-card-thead-1">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="annual-batch-card-tr-1">
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-trainee">Trainee</th>
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-school">School</th>
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-hours">Hours</th>
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-status">Status</th>
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-received">Received</th>
                <th className="px-4 py-2 font-medium" data-cy="annual-batch-card-th-balance">Balance</th>
              </tr>
            </thead>
            <tbody data-cy="annual-batch-card-tbody-1">
              {list.map((t) => {
                const completedHours = t.completedHrs >= t.requiredHrs;
                return (
                  <tr key={t.id} className="border-t border-neutral-100" data-cy="annual-batch-card-tr-2">
                    <td className="px-4 py-2 font-medium text-ink" data-cy="annual-batch-card-td-1">{t.name}</td>
                    <td className="px-4 py-2 text-neutral-600" data-cy="annual-batch-card-td-2">{t.school}</td>
                    <td className="px-4 py-2 font-mono text-xs text-neutral-600" data-cy="annual-batch-card-td-3">
                      {t.completedHrs}/{t.requiredHrs}
                      {completedHours && <CheckCircle2 size={12} className="ml-1 inline text-success-600" data-cy="annual-batch-card-check-circle2-2" />}
                    </td>
                    <td className="px-4 py-2" data-cy="annual-batch-card-td-4">
                      <StatusBadge status={t.status} data-cy="annual-batch-card-status-badge-2" />
                    </td>
                    <td className="px-4 py-2 text-neutral-600" data-cy="annual-batch-card-td-5">{formatCurrency(t.totalAmountPaid)}</td>
                    <td className="px-4 py-2 text-neutral-600" data-cy="annual-batch-card-td-6">{formatCurrency(Math.max(0, t.outstandingBalance))}</td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr data-cy="annual-batch-card-tr-3">
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-neutral-400" data-cy="annual-batch-card-td-no-trainees">
                    No trainees in this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
