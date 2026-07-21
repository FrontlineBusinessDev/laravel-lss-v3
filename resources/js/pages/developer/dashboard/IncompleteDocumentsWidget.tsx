import { useState } from 'react';
import { FileWarning, ChevronRight } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import {
    ModalCenter,
    type ModalComponentProps,
} from '@/components/modal/ModalCenter';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import type { DocumentComplianceRow } from '@/types/modules/dashboard/trainer-dashboard';

const MAX_VISIBLE = 5;

function formatDocType(value: string): string {
    return value
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}

function IncompleteDocumentsRow({
    row,
    onClick,
}: {
    row: DocumentComplianceRow;
    onClick: () => void;
}) {
    return (
        <li className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
                <div className="truncate font-medium text-ink">
                    {row.name}
                    <span className="ml-1.5 text-xs text-neutral-500">
                        {row.batch_code}
                    </span>
                </div>
                <p className="text-danger-700 truncate text-xs">
                    Missing: {row.missing_types.map(formatDocType).join(', ')}
                </p>
            </div>
            <button
                type="button"
                onClick={onClick}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
                View <ChevronRight size={12} />
            </button>
        </li>
    );
}

function IncompleteDocumentsListModalBody({
    data,
    close,
}: ModalComponentProps<DocumentComplianceRow[]>) {
    const navigate = useNavigate();

    return (
        <ul className="flex flex-col gap-3 p-4">
            {(data ?? []).map((row) => (
                <IncompleteDocumentsRow
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

/** Trainees (across every batch) missing one or more required documents. */
export function IncompleteDocumentsWidget() {
    const navigate = useNavigate();
    const [viewAllOpen, setViewAllOpen] = useState(false);
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getDocumentPendingTrainees(),
        [],
    );
    const rows = data ?? [];
    const visibleRows = rows.slice(0, MAX_VISIBLE);
    const remaining = rows.length - visibleRows.length;

    return (
        <DashboardWidgetCard
            title="Trainees with incomplete documents"
            icon={FileWarning}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="All trainees have complete documents."
            className="min-h-76.5"
        >
            <ul className="flex flex-col gap-2">
                {visibleRows.map((row) => (
                    <IncompleteDocumentsRow
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
            <ModalCenter<DocumentComplianceRow[]>
                show={viewAllOpen}
                onClose={() => setViewAllOpen(false)}
                data={rows}
                size="md"
                title="Trainees with incomplete documents"
                ModalComponent={IncompleteDocumentsListModalBody}
            />
        </DashboardWidgetCard>
    );
}
