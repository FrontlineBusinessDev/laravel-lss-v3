import { useState } from 'react';
import { Printer, AlertTriangle, X } from 'lucide-react';
import { biometricsService } from '@/api-service-layer/admin/biometrics';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import { missingPunchLabel } from '@/pages/developer/biometrics/biometricsUtils';
import { BiometricsPrint } from '@/pages/developer/biometrics/BiometricsPrint';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

export default function BiometricsTab({ trainee }: { trainee: TraineeDetail }) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const { data, isLoading, error } = useDashboardWidget(
        () =>
            biometricsService.getTraineeRecords(trainee.id, {
                start_date: dateFrom || undefined,
                end_date: dateTo || undefined,
                training_period_id: trainee.batch_id,
            }),
        [trainee.id, dateFrom, dateTo],
    );
    const records = data?.records ?? [];
    const totalHours = data?.summary.total_hours ?? 0;
    const printGeneratedAt = new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="biometrics-tab-div-1"
                >
                    <div
                        className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
                        data-cy="biometrics-tab-div-2"
                    >
                        <div data-cy="biometrics-tab-div-3">
                            <h3
                                className="text-sm font-semibold text-ink"
                                data-cy="biometrics-tab-h3-biometric-records"
                            >
                                Biometric records
                            </h3>
                            <p
                                className="text-xs text-neutral-500"
                                data-cy="biometrics-tab-p-attendance-logs-for"
                            >
                                Attendance logs for {trainee.name} ·
                                view-and-print only. Import and bulk edits
                                happen in Admin {'>'} Biometrics.
                            </p>
                        </div>
                        <div
                            className="flex flex-wrap items-end gap-2"
                            data-cy="biometrics-tab-div-6"
                        >
                            <div data-cy="biometrics-tab-div-training-period">
                                <label
                                    className="mb-1 block text-[11px] font-medium text-neutral-500"
                                    data-cy="biometrics-tab-label-training-period"
                                >
                                    Training period
                                </label>
                                <Dropdown
                                    options={[trainee.batch?.batch_code ?? '—']}
                                    value={trainee.batch?.batch_code ?? '—'}
                                    onChange={() => {}}
                                    data-cy="biometrics-tab-dropdown-training-period"
                                />
                            </div>
                            <div data-cy="biometrics-tab-div-7">
                                <label
                                    className="mb-1 block text-[11px] font-medium text-neutral-500"
                                    data-cy="biometrics-tab-label-from"
                                >
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    data-cy="biometrics-tab-input-date"
                                />
                            </div>
                            <div data-cy="biometrics-tab-div-10">
                                <label
                                    className="mb-1 block text-[11px] font-medium text-neutral-500"
                                    data-cy="biometrics-tab-label-to"
                                >
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    data-cy="biometrics-tab-input-date-2"
                                />
                            </div>
                            <button
                                onClick={() => setPreviewOpen(true)}
                                disabled={records.length === 0}
                                className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                data-cy="biometrics-tab-button-print"
                            >
                                <Printer
                                    size={13}
                                    data-cy="biometrics-tab-printer-14"
                                />{' '}
                                Print preview
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p
                            className="text-danger-700 mb-3 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs"
                            data-cy="biometrics-tab-p-error"
                        >
                            {error}
                        </p>
                    )}

                    <div
                        className="no-print overflow-hidden rounded-md border border-neutral-200"
                        data-cy="biometrics-tab-div-15"
                    >
                        <table
                            className="w-full border-collapse text-sm"
                            data-cy="biometrics-tab-table-16"
                        >
                            <thead data-cy="biometrics-tab-thead-17">
                                <tr
                                    className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                    data-cy="biometrics-tab-tr-18"
                                >
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-date"
                                    >
                                        Date
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-morning-in"
                                    >
                                        Morning Time In
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-lunch-out"
                                    >
                                        Lunch Out
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-afternoon-in"
                                    >
                                        After Lunch Time In
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-day-out"
                                    >
                                        Day Time Out
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-hours-rendered"
                                    >
                                        Total Daily Hours
                                    </th>
                                    <th
                                        className="px-3 py-2"
                                        data-cy="biometrics-tab-th-remarks"
                                    >
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody data-cy="biometrics-tab-tbody-24">
                                {isLoading && (
                                    <tr data-cy="biometrics-tab-tr-loading">
                                        <td
                                            colSpan={7}
                                            className="px-3 py-8 text-center text-xs text-neutral-400"
                                            data-cy="biometrics-tab-td-loading"
                                        >
                                            Loading biometric records…
                                        </td>
                                    </tr>
                                )}
                                {!isLoading &&
                                    records.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="border-t border-neutral-100"
                                            data-cy="biometrics-tab-tr-25"
                                        >
                                            <td
                                                className="px-3 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="biometrics-tab-td-26"
                                            >
                                                {r.date}
                                            </td>
                                            <td
                                                className="px-3 py-2.5 text-neutral-600"
                                                data-cy="biometrics-tab-td-27"
                                            >
                                                {r.on_leave ? '—' : r.morning_time_in ?? '—'}
                                            </td>
                                            <td
                                                className="px-3 py-2.5 text-neutral-600"
                                                data-cy="biometrics-tab-td-lunch"
                                            >
                                                {r.on_leave ? '—' : r.lunch_time_out ?? '—'}
                                            </td>
                                            <td
                                                className="px-3 py-2.5 text-neutral-600"
                                                data-cy="biometrics-tab-td-afternoon"
                                            >
                                                {r.on_leave ? '—' : r.afternoon_time_in ?? '—'}
                                            </td>
                                            <td
                                                className="px-3 py-2.5 text-neutral-600"
                                                data-cy="biometrics-tab-td-28"
                                            >
                                                {r.on_leave ? '—' : r.day_time_out ?? '—'}
                                            </td>
                                            <td
                                                className="px-3 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="biometrics-tab-td-h"
                                            >
                                                {r.total_hours}h
                                            </td>
                                            <td
                                                className="px-3 py-2.5"
                                                data-cy="biometrics-tab-td-30"
                                            >
                                                {r.on_leave && (
                                                    <span
                                                        className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
                                                        data-cy="biometrics-tab-span-on-leave"
                                                    >
                                                        On leave
                                                    </span>
                                                )}
                                                {!r.on_leave &&
                                                    r.exceptions.length > 0 && (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-pill bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-800"
                                                            data-cy="biometrics-tab-span-32"
                                                        >
                                                            <AlertTriangle
                                                                size={11}
                                                                data-cy="biometrics-tab-alert-triangle-33"
                                                            />{' '}
                                                            {missingPunchLabel(
                                                                r.exceptions,
                                                            )}
                                                        </span>
                                                    )}
                                                {!r.on_leave &&
                                                    r.exceptions.length === 0 &&
                                                    r.remarks && (
                                                        <span
                                                            className="text-xs text-neutral-500"
                                                            data-cy="biometrics-tab-span-remarks"
                                                        >
                                                            {r.remarks}
                                                        </span>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                {!isLoading && records.length === 0 && (
                                    <tr data-cy="biometrics-tab-tr-34">
                                        <td
                                            colSpan={7}
                                            className="px-3 py-8 text-center text-xs text-neutral-400"
                                            data-cy="biometrics-tab-td-no-biometric-records-for-the-selected"
                                        >
                                            No biometric records for the
                                            selected range.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className="no-print mt-3 flex justify-end text-xs text-neutral-500"
                        data-cy="biometrics-tab-div-total-hours-rendered-filtered"
                    >
                        Total hours rendered (filtered):{' '}
                        <span
                            className="ml-1 font-mono font-semibold text-ink"
                            data-cy="biometrics-tab-span-h"
                        >
                            {totalHours}h
                        </span>
                    </div>

                    <Modal
                        open={previewOpen}
                        onClose={() => setPreviewOpen(false)}
                        title="Print preview"
                        maxWidth={720}
                        data-cy="biometrics-tab-modal-print-preview"
                    >
                        <div
                            className="flex flex-col gap-4"
                            data-cy="biometrics-tab-div-preview"
                        >
                            <BiometricsPrint
                                variant="preview"
                                trainee={{
                                    name: trainee.name,
                                    school: trainee.school?.school_name,
                                    batchCode: trainee.batch?.batch_code ?? '',
                                }}
                                records={records}
                                totalHours={totalHours}
                                generatedAt={printGeneratedAt}
                                data-cy="biometrics-tab-biometrics-print-preview"
                            />
                            <div
                                className="flex justify-end gap-2"
                                data-cy="biometrics-tab-div-preview-actions"
                            >
                                <Button
                                    variant="secondary"
                                    icon={X}
                                    onClick={() => setPreviewOpen(false)}
                                    data-cy="biometrics-tab-button-close-preview"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    icon={Printer}
                                    onClick={() => window.print()}
                                    data-cy="biometrics-tab-button-print-confirm"
                                >
                                    Print
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    {previewOpen && (
                        <BiometricsPrint
                            variant="print"
                            trainee={{
                                name: trainee.name,
                                school: trainee.school?.school_name,
                                batchCode: trainee.batch?.batch_code ?? '',
                            }}
                            records={records}
                            totalHours={totalHours}
                            generatedAt={printGeneratedAt}
                            data-cy="biometrics-tab-biometrics-print-38"
                        />
                    )}
                </div>
            </TraineesDetailLayout>
        </>
    );
}
