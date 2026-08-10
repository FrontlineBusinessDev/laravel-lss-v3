import { useState } from 'react';
import { Printer, AlertTriangle, X } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/date';
import { traineeBiometricsService } from '@/api-service-layer/trainee/biometrics';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import { missingPunchLabel } from '@/pages/developer/biometrics/biometricsUtils';
import { BiometricsPrint } from '@/pages/developer/biometrics/BiometricsPrint';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';

interface Props {
    trainee: {
        name: string;
        school: string | null;
        batch_code: string | null;
    };
}

export default function index({ trainee }: Props) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const { data, isLoading, error } = useDashboardWidget(
        () =>
            traineeBiometricsService.getMyRecords({
                start_date: dateFrom || undefined,
                end_date: dateTo || undefined,
            }),
        [dateFrom, dateTo],
    );
    const records = data?.records ?? [];
    const totalHours = data?.summary.total_hours ?? 0;
    const printGeneratedAt = formatDateTime(new Date());

    return (
        <>
            <TraineeLayout title="Biometrics" description="Your attendance logs · view and print only.">
                <div className="rounded-lg border border-neutral-200 bg-white p-5" data-cy="trainee-biometrics-div-1">
                    <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-cy="trainee-biometrics-div-2">
                        <div data-cy="trainee-biometrics-div-3" />
                        <div className="flex flex-wrap items-end gap-2" data-cy="trainee-biometrics-div-filters">
                            <div data-cy="trainee-biometrics-div-from">
                                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="trainee-biometrics-label-from">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    data-cy="trainee-biometrics-input-from"
                                />
                            </div>
                            <div data-cy="trainee-biometrics-div-to">
                                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="trainee-biometrics-label-to">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    data-cy="trainee-biometrics-input-to"
                                />
                            </div>
                            <button
                                onClick={() => setPreviewOpen(true)}
                                disabled={records.length === 0}
                                className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                data-cy="trainee-biometrics-button-print"
                            >
                                <Printer size={13} /> Print preview
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="mb-3 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs text-danger-700" data-cy="trainee-biometrics-p-error">
                            {error}
                        </p>
                    )}

                    <div className="no-print overflow-hidden rounded-md border border-neutral-200" data-cy="trainee-biometrics-div-table-wrap">
                        <table className="w-full border-collapse text-sm" data-cy="trainee-biometrics-table">
                            <thead>
                                <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Morning Time In</th>
                                    <th className="px-3 py-2">Lunch Out</th>
                                    <th className="px-3 py-2">After Lunch Time In</th>
                                    <th className="px-3 py-2">Day Time Out</th>
                                    <th className="px-3 py-2">Total Daily Hours</th>
                                    <th className="px-3 py-2">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-xs text-neutral-400">
                                            Loading biometric records…
                                        </td>
                                    </tr>
                                )}
                                {!isLoading &&
                                    records.map((r) => (
                                        <tr key={r.id} className="border-t border-neutral-100">
                                            <td className="px-3 py-2.5 font-mono text-xs text-neutral-600">{formatDate(r.date)}</td>
                                            <td className="px-3 py-2.5 text-neutral-600">{r.on_leave ? '—' : r.morning_time_in ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-neutral-600">{r.on_leave ? '—' : r.lunch_time_out ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-neutral-600">{r.on_leave ? '—' : r.afternoon_time_in ?? '—'}</td>
                                            <td className="px-3 py-2.5 text-neutral-600">{r.on_leave ? '—' : r.day_time_out ?? '—'}</td>
                                            <td className="px-3 py-2.5 font-mono text-xs text-neutral-600">{r.total_hours}h</td>
                                            <td className="px-3 py-2.5">
                                                {r.on_leave && (
                                                    <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                                        On leave
                                                    </span>
                                                )}
                                                {!r.on_leave && r.exceptions.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded-pill bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-800">
                                                        <AlertTriangle size={11} /> {missingPunchLabel(r.exceptions)}
                                                    </span>
                                                )}
                                                {!r.on_leave && r.exceptions.length === 0 && r.remarks && (
                                                    <span className="text-xs text-neutral-500">{r.remarks}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                {!isLoading && records.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-8 text-center text-xs text-neutral-400">
                                            No biometric records for the selected range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="no-print mt-3 flex justify-end text-xs text-neutral-500" data-cy="trainee-biometrics-div-total">
                        Total hours rendered (filtered):{' '}
                        <span className="ml-1 font-mono font-semibold text-ink">{totalHours}h</span>
                    </div>

                    <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Print preview" maxWidth={720} data-cy="trainee-biometrics-modal-print-preview">
                        <div className="flex flex-col gap-4" data-cy="trainee-biometrics-div-preview">
                            <BiometricsPrint
                                variant="preview"
                                trainee={{ name: trainee.name, school: trainee.school ?? undefined, batchCode: trainee.batch_code ?? '' }}
                                records={records}
                                totalHours={totalHours}
                                generatedAt={printGeneratedAt}
                            />
                            <div className="flex justify-end gap-2" data-cy="trainee-biometrics-div-preview-actions">
                                <Button variant="secondary" icon={X} onClick={() => setPreviewOpen(false)}>
                                    Close
                                </Button>
                                <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                                    Print
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {previewOpen && (
                        <BiometricsPrint
                            variant="print"
                            trainee={{ name: trainee.name, school: trainee.school ?? undefined, batchCode: trainee.batch_code ?? '' }}
                            records={records}
                            totalHours={totalHours}
                            generatedAt={printGeneratedAt}
                        />
                    )}
                </div>
            </TraineeLayout>
        </>
    );
}
