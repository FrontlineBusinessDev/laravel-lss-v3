import { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
    settingsImportService,
    type SettingsImportLogEntry,
} from '@/api-service-layer/developer/settingsImport';

function userLabel(user: SettingsImportLogEntry['imported_by']): string {
    if (!user) return '—';
    const name = `${user.first_name} ${user.last_name}`.trim();
    return name || user.email;
}

function statusClasses(status: SettingsImportLogEntry['status']): string {
    if (status === 'success') return 'text-success-700 bg-success-50';
    if (status === 'failed') return 'text-danger-700 bg-danger-50';
    return 'text-warning-700 bg-warning-50';
}

/** Recent Settings > Import runs, each with an undo action scoped to exactly what that import created. */
export function ImportLogsPanel({ refreshKey }: { refreshKey: number }) {
    const [logs, setLogs] = useState<SettingsImportLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [rollingBackId, setRollingBackId] = useState<number | null>(null);
    const [rollbackErrors, setRollbackErrors] = useState<Record<number, string[]>>({});
    const [confirmTarget, setConfirmTarget] = useState<SettingsImportLogEntry | null>(null);

    async function loadLogs() {
        setLoading(true);
        try {
            setLogs(await settingsImportService.listLogs());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    async function handleRollback(log: SettingsImportLogEntry) {
        setConfirmTarget(null);
        setRollingBackId(log.id);
        try {
            const res = await settingsImportService.rollback(log.id);
            setRollbackErrors((prev) => ({ ...prev, [log.id]: res.errors }));
            await loadLogs();
        } catch {
            setRollbackErrors((prev) => ({ ...prev, [log.id]: ['Rollback failed — please try again.'] }));
        } finally {
            setRollingBackId(null);
        }
    }

    if (loading) {
        return <p className="mt-6 text-xs text-neutral-500">Loading recent imports…</p>;
    }

    if (logs.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">Recent imports</h2>
            <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
                <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500">
                        <tr>
                            <th className="px-3 py-2 font-medium">Type</th>
                            <th className="px-3 py-2 font-medium">File</th>
                            <th className="px-3 py-2 font-medium">Result</th>
                            <th className="px-3 py-2 font-medium">Imported by</th>
                            <th className="px-3 py-2 font-medium">Date</th>
                            <th className="px-3 py-2 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="border-t border-neutral-100" data-cy={`import-log-${log.id}`}>
                                <td className="px-3 py-2 font-medium text-ink">{log.type}</td>
                                <td className="px-3 py-2 text-neutral-600">{log.file_name}</td>
                                <td className="px-3 py-2">
                                    <span className={`rounded px-1.5 py-0.5 font-medium ${statusClasses(log.status)}`}>
                                        {log.success_count}/{log.total_rows} ({log.status})
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-neutral-600">{userLabel(log.imported_by)}</td>
                                <td className="px-3 py-2 text-neutral-500">{new Date(log.created_at).toLocaleString()}</td>
                                <td className="px-3 py-2 text-right">
                                    {log.rolled_back_at ? (
                                        <span className="text-neutral-400">Rolled back</span>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            icon={RotateCcw}
                                            disabled={rollingBackId === log.id}
                                            onClick={() => setConfirmTarget(log)}
                                        >
                                            {rollingBackId === log.id ? 'Rolling back…' : 'Rollback'}
                                        </Button>
                                    )}
                                    {rollbackErrors[log.id]?.length ? (
                                        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-left text-danger-700">
                                            {rollbackErrors[log.id].map((e, i) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <AlertCircle size={11} className="mt-0.5 shrink-0" /> {e}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
