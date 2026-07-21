import { Eye, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import {
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { ConfirmDeleteLogsModal } from '@/components/modal/ConfirmDeleteLogsModal';
import { ApiError } from '@/api-service-layer/client';
import { systemLogService } from '@/api-service-layer/developer/system-log';
import {
    ActionBadge,
    actorName,
    columns,
    formatWhen,
    subjectType,
    type LogRow,
} from '@/types/modules/developer/system-log';
import { LogDetailModal } from './LogDetailModal';

// When | Subject | Actor | Action(badge) | menu
const GRID = 'sm:grid-cols-[1.4fr_1.6fr_1.2fr_0.9fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={GRID}
        labels={['When', 'Subject', 'Actor', 'Action']}
        data-cy="index-settings-list-header-1"
    />
);

/**
 * Developer-only audit trail. Read-only via the table itself: create/edit are
 * disabled and each row opens a detail modal instead. The one write action is
 * "Delete logs in range", which reuses the same date-range filter already
 * exposed by the `created_at` column and re-authenticates via password before
 * the backend hard-deletes matching rows.
 */
export default function index() {
    const [selected, setSelected] = useState<LogRow | null>(null);
    const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const refreshRef = useRef<(() => void) | undefined>(undefined);
    const { showToast } = useToast();

    const renderRow = (row: LogRow) => (
        <SettingsRow
            grid={GRID}
            badge={
                <ActionBadge
                    action={row.action}
                    data-cy="index-action-badge-3"
                />
            }
            menu={[
                {
                    label: 'View details',
                    icon: Eye,
                    onClick: () => setSelected(row),
                },
            ]}
            data-cy="index-settings-row-2"
        >
            <TextCell data-cy="index-text-cell-4">
                {formatWhen(row.created_at)}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-5">
                {subjectType(row.loggable_type)}
                {row.subject_label ? ` · ${row.subject_label}` : ''}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-6">
                {actorName(row.actor)}
            </TextCell>
        </SettingsRow>
    );

    async function handleConfirmDelete(password: string) {
        if (!dateRange.from || !dateRange.to) {
            return;
        }
        setBusy(true);
        setPasswordError(null);
        try {
            const result = await systemLogService.deleteRange({
                current_password: password,
                created_at_from: dateRange.from,
                created_at_to: dateRange.to,
            });
            setConfirmOpen(false);
            showToast(`Deleted ${result.deleted} log entr${result.deleted === 1 ? 'y' : 'ies'}.`, 'success');
            refreshRef.current?.();
        } catch (err) {
            if (err instanceof ApiError && err.status === 422 && err.errors?.current_password) {
                setPasswordError(err.errors.current_password[0]);
            } else {
                showToast('Failed to delete logs. Please try again.', 'error');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-ink">
                        System Logs
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Read Logs for whole wide system monitoring.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    icon={Trash2}
                    disabled={!dateRange.from || !dateRange.to}
                    onClick={() => setConfirmOpen(true)}
                    data-cy="index-button-delete-logs-in-range"
                >
                    Delete logs in range
                </Button>
            </div>
            <DataTableCardField<LogRow>
                apiUrl="/system-log"
                apiQueryKey="developer-system-log"
                columns={columns}
                enableCreate={false}
                enableEdit={false}
                defaultSortBy="created_at"
                defaultSortDir="desc"
                listHeader={listHeader}
                renderCard={renderRow}
                onRefreshRef={(fn) => (refreshRef.current = fn)}
                onFiltersChange={(filters) =>
                    setDateRange({
                        from: typeof filters.created_at_from === 'string' ? filters.created_at_from : undefined,
                        to: typeof filters.created_at_to === 'string' ? filters.created_at_to : undefined,
                    })
                }
                data-cy="index-data-table-field-7"
            />
            {selected && (
                <LogDetailModal
                    log={selected}
                    onClose={() => setSelected(null)}
                    data-cy="index-log-detail-modal-set-selected"
                />
            )}
            <ConfirmDeleteLogsModal
                open={confirmOpen}
                busy={busy}
                dateFrom={dateRange.from ?? ''}
                dateTo={dateRange.to ?? ''}
                error={passwordError}
                onCancel={() => {
                    setConfirmOpen(false);
                    setPasswordError(null);
                }}
                onConfirm={handleConfirmDelete}
                data-cy="index-confirm-delete-logs-modal-8"
            />
        </>
    );
}
