import { AlertCircle, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { settingsImportService } from '@/api-service-layer/developer/settingsImport';
import {
    columns,
    formatWhen,
    ImportStatusBadge,
    userLabel,
    type ImportLogRow,
} from '@/types/modules/developer/import-logs';

const GRID = 'sm:grid-cols-[1fr_1.6fr_1.3fr_1.3fr_1.1fr_2.5rem]';
const listHeader = <SettingsListHeader grid={GRID} labels={['Type', 'File', 'Result', 'Imported by', 'Date']} />;

/** Recent Settings > Import runs, each with an undo action scoped to exactly what that import created. */
export function ImportLogsPanel({ refreshKey }: { refreshKey: number }) {
    const [rollingBackId, setRollingBackId] = useState<number | null>(null);
    const [rollbackErrors, setRollbackErrors] = useState<Record<number, string[]>>({});
    const [confirmTarget, setConfirmTarget] = useState<ImportLogRow | null>(null);
    const refreshRef = useRef<(() => void) | undefined>(undefined);

    // A fresh import just ran — refresh the table so the newest log shows up.
    const prevRefreshKey = useRef(refreshKey);
    useEffect(() => {
        if (prevRefreshKey.current !== refreshKey) {
            prevRefreshKey.current = refreshKey;
            refreshRef.current?.();
        }
    }, [refreshKey]);

    async function handleRollback(log: ImportLogRow) {
        setConfirmTarget(null);
        setRollingBackId(log.id);
        try {
            const res = await settingsImportService.rollback(log.id);
            setRollbackErrors((prev) => ({ ...prev, [log.id]: res.errors }));
            refreshRef.current?.();
        } catch {
            setRollbackErrors((prev) => ({ ...prev, [log.id]: ['Rollback failed — please try again.'] }));
        } finally {
            setRollingBackId(null);
        }
    }

    const renderRow = (log: ImportLogRow) => (
        <div key={log.id}>
            <SettingsRow
                grid={GRID}
                badge={<ImportStatusBadge log={log} />}
                menu={[
                    {
                        label: log.rolled_back_at ? 'Rolled back' : rollingBackId === log.id ? 'Rolling back…' : 'Rollback',
                        icon: RotateCcw,
                        danger: true,
                        disabled: !!log.rolled_back_at || rollingBackId === log.id,
                        onClick: () => setConfirmTarget(log),
                    },
                ]}
            >
                <TextCell>{log.type}</TextCell>
                <TextCell muted>{log.file_name}</TextCell>
                <TextCell muted>{userLabel(log.imported_by)}</TextCell>
                <TextCell muted>{formatWhen(log.created_at)}</TextCell>
            </SettingsRow>
            {rollbackErrors[log.id]?.length ? (
                <ul className="mb-2 list-disc space-y-0.5 pl-8 text-xs text-danger-700">
                    {rollbackErrors[log.id].map((e, i) => (
                        <li key={i} className="flex items-start gap-1">
                            <AlertCircle size={11} className="mt-0.5 shrink-0" /> {e}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );

    return (
        <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">Recent imports</h2>
            <DataTableCardField<ImportLogRow>
                apiUrl="/settings/import/logs"
                apiQueryKey="settings-import-logs"
                columns={columns}
                enableCreate={false}
                enableEdit={false}
                defaultSortBy="created_at"
                defaultSortDir="desc"
                listHeader={listHeader}
                renderCard={renderRow}
                onRefreshRef={(fn) => (refreshRef.current = fn)}
            />

            <ConfirmDialog
                open={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={() => confirmTarget && void handleRollback(confirmTarget)}
                title="Roll back this import?"
                description={
                    confirmTarget ? (
                        <>
                            This deletes the records created by the <strong>{confirmTarget.type}</strong> import of{' '}
                            <strong>{confirmTarget.file_name}</strong>. Records this import only matched (not created)
                            are left untouched.
                        </>
                    ) : null
                }
                confirmLabel="Roll back"
                tone="danger"
            />
        </div>
    );
}
