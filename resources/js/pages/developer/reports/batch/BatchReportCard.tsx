import { ChevronDown, ChevronRight, ClipboardList, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { ReportBatch } from '@/api-service-layer/developer/report';
import { formatCurrency } from '../reportsUtils';

interface BatchReportCardProps {
    batch: ReportBatch;
    isOpen: boolean;
    onToggle: () => void;
}

export function BatchReportCard({
    batch,
    isOpen,
    onToggle,
}: BatchReportCardProps) {
    const list = batch.trainees;
    const fin = batch.financials;
    const activities = batch.activities ?? [];

    return (
        <div
            className="overflow-hidden border border-neutral-200 bg-white"
            data-cy="batch-report-card-div-1"
        >
            <button
                onClick={onToggle}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-3.5 text-left transition-colors hover:bg-neutral-50"
                data-cy="batch-report-card-button-toggle"
            >
                {isOpen ? (
                    <ChevronDown
                        size={16}
                        className="shrink-0 text-neutral-400"
                        data-cy="batch-report-card-chevron-down"
                    />
                ) : (
                    <ChevronRight
                        size={16}
                        className="shrink-0 text-neutral-400"
                        data-cy="batch-report-card-chevron-right"
                    />
                )}
                <div
                    className="min-w-[140px]"
                    data-cy="batch-report-card-div-2"
                >
                    <div
                        className="font-mono text-xs font-semibold text-ink"
                        data-cy="batch-report-card-div-3"
                    >
                        {batch.batchNo}
                    </div>
                    <div
                        className="text-xs text-neutral-500"
                        data-cy="batch-report-card-div-4"
                    >
                        {batch.programType}
                    </div>
                </div>
                <StatusBadge
                    status={batch.status}
                    data-cy="batch-report-card-status-badge"
                />
                <div
                    className="text-xs text-neutral-500"
                    data-cy="batch-report-card-div-5"
                >
                    {batch.industry} &middot; {batch.setup}
                </div>
                <div
                    className="text-xs text-neutral-500"
                    data-cy="batch-report-card-div-6"
                >
                    {batch.started} &ndash; {batch.projectedEnd}
                </div>
                <div
                    className="flex items-center gap-1 text-xs text-neutral-600"
                    data-cy="batch-report-card-div-activities"
                >
                    <ClipboardList
                        size={13}
                        className="text-neutral-400"
                        data-cy="batch-report-card-clipboard-list"
                    />{' '}
                    {activities.length} activities completed
                </div>
                <div
                    className="ml-auto flex gap-5 text-right"
                    data-cy="batch-report-card-div-7"
                >
                    <div data-cy="batch-report-card-div-8">
                        <div
                            className="text-[10px] text-neutral-400"
                            data-cy="batch-report-card-div-received"
                        >
                            Received
                        </div>
                        <div
                            className="text-xs font-semibold text-ink"
                            data-cy="batch-report-card-div-9"
                        >
                            {formatCurrency(fin.totalReceived)}
                        </div>
                    </div>
                    <div data-cy="batch-report-card-div-10">
                        <div
                            className="text-[10px] text-neutral-400"
                            data-cy="batch-report-card-div-balance"
                        >
                            Balance
                        </div>
                        <div
                            className={cn(
                                'text-xs font-semibold',
                                fin.totalBalance > 0
                                    ? 'text-warning-700'
                                    : 'text-ink',
                            )}
                            data-cy="batch-report-card-div-11"
                        >
                            {formatCurrency(fin.totalBalance)}
                        </div>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div
                    className="border-t border-neutral-100 p-4"
                    data-cy="batch-report-card-div-12"
                >
                    <div
                        className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs sm:grid-cols-4"
                        data-cy="batch-report-card-div-13"
                    >
                        <div data-cy="batch-report-card-div-14">
                            <div
                                className="text-[10px] text-neutral-400"
                                data-cy="batch-report-card-div-trainees"
                            >
                                Trainees
                            </div>
                            <div
                                className="font-semibold text-ink"
                                data-cy="batch-report-card-div-15"
                            >
                                {list.length}
                            </div>
                        </div>
                        <div data-cy="batch-report-card-div-16">
                            <div
                                className="text-[10px] text-neutral-400"
                                data-cy="batch-report-card-div-created"
                            >
                                Created
                            </div>
                            <div
                                className="font-semibold text-ink"
                                data-cy="batch-report-card-div-17"
                            >
                                {batch.createdDate}
                            </div>
                        </div>
                        <div data-cy="batch-report-card-div-18">
                            <div
                                className="text-[10px] text-neutral-400"
                                data-cy="batch-report-card-div-total-received"
                            >
                                Total received
                            </div>
                            <div
                                className="text-success-700 font-semibold"
                                data-cy="batch-report-card-div-19"
                            >
                                {formatCurrency(fin.totalReceived)}
                            </div>
                        </div>
                        <div data-cy="batch-report-card-div-20">
                            <div
                                className="text-[10px] text-neutral-400"
                                data-cy="batch-report-card-div-total-balance"
                            >
                                Total balance
                            </div>
                            <div
                                className={cn(
                                    'font-semibold',
                                    fin.totalBalance > 0
                                        ? 'text-warning-700'
                                        : 'text-ink',
                                )}
                                data-cy="batch-report-card-div-21"
                            >
                                {formatCurrency(fin.totalBalance)}
                            </div>
                        </div>
                    </div>

                    <div
                        className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink"
                        data-cy="batch-report-card-div-completed-activities"
                    >
                        <Wallet
                            size={13}
                            className="text-neutral-400"
                            data-cy="batch-report-card-wallet"
                        />{' '}
                        Completed activities
                    </div>
                    <div
                        className="lss-scrollbar overflow-x-auto rounded-md border border-neutral-200"
                        data-cy="batch-report-card-div-22"
                    >
                        <table
                            className="w-full min-w-[720px] border-collapse text-sm"
                            data-cy="batch-report-card-table-1"
                        >
                            <thead data-cy="batch-report-card-thead-1">
                                <tr
                                    className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                    data-cy="batch-report-card-tr-1"
                                >
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-task"
                                    >
                                        Task
                                    </th>
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-trainee"
                                    >
                                        Trainee
                                    </th>
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-trainer"
                                    >
                                        Trainer
                                    </th>
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-time-goal"
                                    >
                                        Time goal
                                    </th>
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-time-spent"
                                    >
                                        Time spent
                                    </th>
                                    <th
                                        className="px-3 py-2 font-medium"
                                        data-cy="batch-report-card-th-date"
                                    >
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-cy="batch-report-card-tbody-1">
                                {activities.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-t border-neutral-100"
                                        data-cy="batch-report-card-tr-2"
                                    >
                                        <td
                                            className="px-3 py-2 font-medium text-ink"
                                            data-cy="batch-report-card-td-1"
                                        >
                                            {a.task}
                                        </td>
                                        <td
                                            className="px-3 py-2 text-neutral-600"
                                            data-cy="batch-report-card-td-2"
                                        >
                                            {a.trainee}
                                        </td>
                                        <td
                                            className="px-3 py-2 text-neutral-600"
                                            data-cy="batch-report-card-td-3"
                                        >
                                            {a.trainer}
                                        </td>
                                        <td
                                            className="px-3 py-2 font-mono text-xs text-neutral-600"
                                            data-cy="batch-report-card-td-4"
                                        >
                                            {a.timeGoal}h
                                        </td>
                                        <td
                                            className="px-3 py-2 font-mono text-xs text-neutral-600"
                                            data-cy="batch-report-card-td-5"
                                        >
                                            {a.timeSpent}h
                                        </td>
                                        <td
                                            className="px-3 py-2 font-mono text-xs text-neutral-600"
                                            data-cy="batch-report-card-td-6"
                                        >
                                            {a.date}
                                        </td>
                                    </tr>
                                ))}
                                {activities.length === 0 && (
                                    <tr data-cy="batch-report-card-tr-3">
                                        <td
                                            colSpan={6}
                                            className="px-3 py-6 text-center text-xs text-neutral-400"
                                            data-cy="batch-report-card-td-no-activities"
                                        >
                                            No completed activities recorded for
                                            this batch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
