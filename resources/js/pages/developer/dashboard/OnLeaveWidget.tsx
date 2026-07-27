import { CalendarOff } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import { ModalCenter } from '@/components/modal/ModalCenter';
import { useState } from 'react';
import type { ModalComponentProps } from '@/components/modal/ModalCenter';
import type { OnLeaveTrainee } from '@/types/modules/dashboard/trainer-dashboard';

const MAX_VISIBLE = 5;

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    });
}

function OnLeaveRow({
    row,
    onClick,
}: {
    row: OnLeaveTrainee;
    onClick: () => void;
}) {
    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
            >
                <div>
                    <span className="font-medium text-ink">{row.name}</span>
                    <span className="ml-1.5 text-xs text-neutral-500">
                        {row.batch_code}
                    </span>
                </div>
                <span className="shrink-0 text-xs text-neutral-500">
                    {row.leave_type ?? 'Leave'} · back{' '}
                    {formatDate(row.return_date)}
                </span>
            </button>
        </li>
    );
}

function OnLeaveListModalBody({
    data,
    close,
}: ModalComponentProps<OnLeaveTrainee[]>) {
    const navigate = useNavigate();

    return (
        <ul className="flex flex-col gap-1 p-4">
            {(data ?? []).map((row) => (
                <OnLeaveRow
                    key={row.trainee_id}
                    row={row}
                    onClick={() => {
                        close();
                        navigate(`/trainees/${row.trainee_id}`);
                    }}
                />
            ))}
        </ul>
    );
}

/** Trainees currently on approved leave, across every batch. */
export function OnLeaveWidget() {
    const navigate = useNavigate();
    const [viewAllOpen, setViewAllOpen] = useState(false);
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getOnLeaveTrainees(),
        [],
    );
    const rows = data ?? [];
    const visibleRows = rows.slice(0, MAX_VISIBLE);
    const remaining = rows.length - visibleRows.length;

    return (
        <DashboardWidgetCard
            title="Trainees on leave"
            icon={CalendarOff}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No trainees currently on leave."
        >
            <ul className="flex flex-col gap-1">
                {visibleRows.map((row) => (
                    <OnLeaveRow
                        key={row.trainee_id}
                        row={row}
                        onClick={() => navigate(`/trainees/${row.trainee_id}`)}
                    />
                ))}
            </ul>
            {remaining > 0 && (
                <button
                    type="button"
                    onClick={() => setViewAllOpen(true)}
                    className="mt-2 text-xs font-medium text-brand-600 hover:underline"
                >
                    View {remaining} more
                </button>
            )}
            <ModalCenter<OnLeaveTrainee[]>
                show={viewAllOpen}
                onClose={() => setViewAllOpen(false)}
                data={rows}
                size="sm"
                title="Trainees on leave"
                ModalComponent={OnLeaveListModalBody}
            />
        </DashboardWidgetCard>
    );
}
