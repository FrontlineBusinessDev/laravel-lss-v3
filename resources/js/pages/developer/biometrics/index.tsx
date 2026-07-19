import { useEffect, useMemo, useState } from 'react';
import {
    Upload,
    Printer,
    AlertTriangle,
    Search,
    Pencil,
    Trash2,
    Eye,
    History,
    X,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { useToast } from '@/components/Toast';
import { biometricsService } from '@/api-service-layer/admin/biometrics';
import { batchService } from '@/api-service-layer/admin/batch';
import type {
    BiometricImportSummary,
    BiometricLogRow,
} from '@/types/modules/biometrics/biometrics';
import { cn } from '@/lib/utils';
import {
    missingPunchLabel,
    summarizeAttendance,
    toImportRow,
    type ParsedRow,
} from '@/pages/developer/biometrics/biometricsUtils';
import { ImportCsvModal } from '@/pages/developer/biometrics/ImportCsvModal';
import {
    EditRecordModal,
    type RecordFormValues,
} from '@/pages/developer/biometrics/EditRecordModal';
import { BiometricsPrint } from '@/pages/developer/biometrics/BiometricsPrint';

const TABS = ['Daily records', 'Trainee summary'] as const;
const IMPORT_STATUS_STYLE: Record<string, string> = {
    success: 'bg-success-50 text-success-800',
    partial: 'bg-warning-50 text-warning-800',
    failed: 'bg-danger-50 text-danger-800',
};
const IMPORT_STATUS_LABEL: Record<string, string> = {
    success: 'Success',
    partial: 'Partial',
    failed: 'Failed',
};
type PreviewTrainee = { name: string; batchCode: string } | null;
export default function BiometricsPage() {
    const { showToast } = useToast();
    const [tab, setTab] = useState<(typeof TABS)[number]>('Daily records');
    const [records, setRecords] = useState<BiometricLogRow[]>([]);
    const [imports, setImports] = useState<BiometricImportSummary[]>([]);
    const [batchOptions, setBatchOptions] = useState<
        { id: number; batch_code: string }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [batchFilter, setBatchFilter] = useState('All batches');
    const [importFilter, setImportFilter] = useState('Most recent import');
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<BiometricLogRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BiometricLogRow | null>(
        null,
    );
    const [previewTrainee, setPreviewTrainee] = useState<PreviewTrainee>(null);

    async function loadRecords() {
        const data = await biometricsService.getRecords();
        setRecords(data);
    }
    async function loadImports() {
        const data = await biometricsService.getImports();
        setImports(data);
    }
    useEffect(() => {
        setLoading(true);
        Promise.all([
            loadRecords(),
            loadImports(),
            batchService
                .searchActive()
                .then((rows) =>
                    setBatchOptions(
                        rows as unknown as { id: number; batch_code: string }[],
                    ),
                ),
        ]).finally(() => setLoading(false));
    }, []);

    const sortedImports = useMemo(
        () =>
            [...imports].sort((a, b) => (a.imported_at < b.imported_at ? 1 : -1)),
        [imports],
    );
    const mostRecentImportId = sortedImports[0]?.id ?? null;
    const importOptions = [
        'Most recent import',
        'All records',
        ...sortedImports.map((i) => String(i.id)),
    ];
    const importOptionLabel = (id: string) => {
        if (id === 'Most recent import' || id === 'All records') return id;
        const imp = imports.find((i) => String(i.id) === id);
        return imp ? `${imp.file_name} (${imp.imported_at})` : id;
    };
    const scoped = useMemo(() => {
        const q = query.trim().toLowerCase();
        return records.filter((record) => {
            if (
                importFilter === 'Most recent import' &&
                mostRecentImportId &&
                record.import_id !== mostRecentImportId
            )
                return false;
            if (
                importFilter !== 'Most recent import' &&
                importFilter !== 'All records' &&
                String(record.import_id) !== importFilter
            )
                return false;
            if (
                batchFilter !== 'All batches' &&
                record.batch_code !== batchFilter
            )
                return false;
            if (q && !record.trainee_name.toLowerCase().includes(q))
                return false;
            return true;
        });
    }, [records, importFilter, batchFilter, query, mostRecentImportId]);
    const dailyRows = useMemo(
        () => [...scoped].sort((a, b) => (a.date < b.date ? 1 : -1)),
        [scoped],
    );
    const summaryRows = useMemo(() => {
        const byTrainee = new Map<
            number,
            { trainee_name: string; batch_code: string | null; records: BiometricLogRow[] }
        >();
        for (const record of scoped) {
            const entry = byTrainee.get(record.trainee_id) ?? {
                trainee_name: record.trainee_name,
                batch_code: record.batch_code,
                records: [],
            };
            entry.records.push(record);
            byTrainee.set(record.trainee_id, entry);
        }
        return [...byTrainee.entries()]
            .map(([traineeId, e]) => ({
                traineeId,
                ...e,
                totalHours: e.records.reduce((sum, r) => sum + r.total_hours, 0),
            }))
            .sort((a, b) => a.trainee_name.localeCompare(b.trainee_name));
    }, [scoped]);

    async function handleConfirmImport(
        fileName: string,
        validRows: ParsedRow[],
        totalRows: number,
        errorCount: number,
    ) {
        try {
            const result = await biometricsService.import({
                file_name: fileName || 'import.csv',
                rows: validRows.map(toImportRow),
                total_rows: totalRows,
                error_count: errorCount,
            });
            await Promise.all([loadRecords(), loadImports()]);
            setImportModalOpen(false);
            setImportFilter('Most recent import');
            if (result.import.status === 'success') {
                showToast(
                    `Import successful — ${result.created_count} record${result.created_count === 1 ? '' : 's'} added.`,
                    'success',
                );
            } else if (result.import.status === 'partial') {
                showToast(
                    `Import partially successful — ${result.created_count} added, ${result.skipped_count + errorCount} skipped due to errors.`,
                    'info',
                );
            } else {
                showToast(
                    `Import failed — no records were added.`,
                    'error',
                );
            }
        } catch {
            showToast('Import failed. Please try again.', 'error');
        }
    }
    async function handleSaveEdit(id: number, values: RecordFormValues) {
        try {
            await biometricsService.updateRecord(id, {
                date: values.date,
                on_leave: values.onLeave,
                morning_time_in: values.onLeave ? null : values.morningTimeIn || null,
                lunch_time_out: values.onLeave ? null : values.lunchTimeOut || null,
                afternoon_time_in: values.onLeave ? null : values.afternoonTimeIn || null,
                day_time_out: values.onLeave ? null : values.dayTimeOut || null,
                remarks: values.remarks || null,
            });
            await loadRecords();
            setEditTarget(null);
            showToast('Attendance record updated.', 'success');
        } catch {
            showToast('Failed to update record.', 'error');
        }
    }
    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await biometricsService.deleteRecord(deleteTarget.id);
            await loadRecords();
            showToast(
                `Record for ${deleteTarget.trainee_name} on ${deleteTarget.date} was deleted.`,
                'error',
            );
        } catch {
            showToast('Failed to delete record.', 'error');
        } finally {
            setDeleteTarget(null);
        }
    }
    const previewRecords = previewTrainee
        ? scoped.filter(
              (r) =>
                  r.trainee_name === previewTrainee.name &&
                  r.batch_code === previewTrainee.batchCode,
          )
        : [];
    const previewTotalHours = previewRecords.reduce(
        (sum, r) => sum + r.total_hours,
        0,
    );
    const printGeneratedAt = new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    return (
        <div data-cy="index-div-1">
            <div
                className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                data-cy="index-div-2"
            >
                <div data-cy="index-div-3">
                    <h1
                        className="text-xl font-semibold text-ink"
                        data-cy="index-h1-biometrics"
                    >
                        Biometrics
                    </h1>
                    <p
                        className="text-sm text-neutral-500"
                        data-cy="index-p-import-review-and-manage-trainee-attendance"
                    >
                        Import, review, and manage trainee attendance records
                    </p>
                </div>
                <div className="flex gap-2" data-cy="index-div-6">
                    <Button
                        variant="secondary"
                        icon={History}
                        onClick={() => setHistoryOpen(true)}
                        data-cy="index-button-set-history-open"
                    >
                        Import history
                    </Button>
                    <Button
                        variant="primary"
                        icon={Upload}
                        onClick={() => setImportModalOpen(true)}
                        data-cy="index-button-set-import-modal-open"
                    >
                        Import CSV
                    </Button>
                </div>
            </div>

            <div
                className="no-print mb-4 flex gap-5 border-b border-neutral-200 pl-0.5"
                data-cy="index-div-9"
            >
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'pb-2.5 text-xs font-medium transition-colors',
                            tab === t
                                ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                        data-cy="index-button-set-tab"
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div
                className="no-print mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3"
                data-cy="index-div-11"
            >
                <div
                    className="relative w-full flex-1 sm:min-w-[200px]"
                    data-cy="index-div-12"
                >
                    <Search
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                        data-cy="index-search-13"
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search trainee..."
                        className="h-9 w-full rounded-md border border-neutral-200 pr-2.5 pl-8 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                        data-cy="index-input-search-trainee"
                    />
                </div>
                <div className="w-full sm:w-44" data-cy="index-div-15">
                    <Dropdown
                        options={[
                            'All batches',
                            ...batchOptions.map((b) => b.batch_code),
                        ]}
                        value={batchFilter}
                        onChange={setBatchFilter}
                        data-cy="index-dropdown-set-batch-filter"
                    />
                </div>
                <div className="w-full sm:w-56" data-cy="index-div-17">
                    <Dropdown
                        options={importOptions.map(importOptionLabel)}
                        value={importOptionLabel(importFilter)}
                        onChange={(label) => {
                            const match = importOptions.find(
                                (id) => importOptionLabel(id) === label,
                            );
                            if (match) setImportFilter(match);
                        }}
                        data-cy="index-dropdown-18"
                    />
                </div>
            </div>

            {loading && (
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-10 text-center text-xs text-neutral-400"
                    data-cy="index-div-loading"
                >
                    Loading biometric records…
                </div>
            )}

            {!loading && tab === 'Daily records' && (
                <>
                    <div
                        className="no-print hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block"
                        data-cy="index-div-19"
                    >
                        <div
                            className="lss-scrollbar overflow-x-auto"
                            data-cy="index-div-20"
                        >
                            <table
                                className="w-full min-w-[1080px] border-collapse text-sm"
                                data-cy="index-table-21"
                            >
                                <thead data-cy="index-thead-22">
                                    <tr
                                        className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                        data-cy="index-tr-23"
                                    >
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-trainee"
                                        >
                                            Trainee
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-batch"
                                        >
                                            Batch
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-date"
                                        >
                                            Date
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-morning-in"
                                        >
                                            Morning In
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-lunch-out"
                                        >
                                            Lunch Out
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-afternoon-in"
                                        >
                                            Afternoon In
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-day-out"
                                        >
                                            Day Out
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-hours"
                                        >
                                            Hours
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-remarks"
                                        >
                                            Remarks
                                        </th>
                                        <th
                                            className="px-4 py-2.5 text-right font-medium"
                                            data-cy="index-th-actions"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody data-cy="index-tbody-32">
                                    {dailyRows.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="border-t border-neutral-100 transition-colors hover:bg-neutral-50"
                                            data-cy="index-tr-33"
                                        >
                                            <td
                                                className="px-4 py-2.5 font-medium text-ink"
                                                data-cy="index-td-34"
                                            >
                                                {record.trainee_name}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="index-td-35"
                                            >
                                                {record.batch_code}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="index-td-36"
                                            >
                                                {record.date}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 text-neutral-600"
                                                data-cy="index-td-37"
                                            >
                                                {record.on_leave ? '—' : record.morning_time_in ?? '—'}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 text-neutral-600"
                                                data-cy="index-td-lunch"
                                            >
                                                {record.on_leave ? '—' : record.lunch_time_out ?? '—'}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 text-neutral-600"
                                                data-cy="index-td-afternoon"
                                            >
                                                {record.on_leave ? '—' : record.afternoon_time_in ?? '—'}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 text-neutral-600"
                                                data-cy="index-td-39"
                                            >
                                                {record.on_leave ? '—' : record.day_time_out ?? '—'}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="index-td-h"
                                            >
                                                {record.total_hours}h
                                            </td>
                                            <td
                                                className="px-4 py-2.5"
                                                data-cy="index-td-42"
                                            >
                                                <div
                                                    className="flex flex-wrap items-center gap-1"
                                                    data-cy="index-div-43"
                                                >
                                                    {record.on_leave && (
                                                        <span
                                                            className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600"
                                                            data-cy="index-span-on-leave"
                                                        >
                                                            On Leave
                                                        </span>
                                                    )}
                                                    {!record.on_leave &&
                                                        record.exceptions.length > 0 && (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-pill bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-800"
                                                                data-cy="index-span-45"
                                                            >
                                                                <AlertTriangle
                                                                    size={11}
                                                                    data-cy="index-alert-triangle-46"
                                                                />{' '}
                                                                {missingPunchLabel(
                                                                    record.exceptions,
                                                                )}
                                                            </span>
                                                        )}
                                                    {!record.on_leave &&
                                                        record.remarks && (
                                                            <span
                                                                className="text-xs text-neutral-500"
                                                                data-cy="index-span-47"
                                                            >
                                                                {record.remarks}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td
                                                className="px-4 py-2.5"
                                                data-cy="index-td-48"
                                            >
                                                <div
                                                    className="flex justify-end gap-0.5"
                                                    data-cy="index-div-49"
                                                >
                                                    <TooltipIconButton
                                                        icon={Pencil}
                                                        label="Edit"
                                                        onClick={() =>
                                                            setEditTarget(record)
                                                        }
                                                        data-cy="index-tooltip-icon-button-edit"
                                                    />
                                                    <TooltipIconButton
                                                        icon={Trash2}
                                                        label="Delete"
                                                        danger
                                                        onClick={() =>
                                                            setDeleteTarget(record)
                                                        }
                                                        data-cy="index-tooltip-icon-button-delete"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {dailyRows.length === 0 && (
                                        <tr data-cy="index-tr-52">
                                            <td
                                                colSpan={10}
                                                className="px-4 py-10 text-center text-xs text-neutral-400"
                                                data-cy="index-td-no-biometric-records-match-your-search"
                                            >
                                                No biometric records match your
                                                search or filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile cards */}
                    <div
                        className="no-print flex flex-col gap-2 sm:hidden"
                        data-cy="index-div-54"
                    >
                        {dailyRows.map((record) => (
                            <div
                                key={record.id}
                                className="rounded-lg border border-neutral-200 bg-white p-3.5"
                                data-cy="index-div-55"
                            >
                                <button
                                    onClick={() => setEditTarget(record)}
                                    className="flex w-full items-start justify-between gap-2 text-left"
                                    data-cy="index-button-set-edit-target"
                                >
                                    <div
                                        className="min-w-0"
                                        data-cy="index-div-57"
                                    >
                                        <p
                                            className="truncate text-sm font-semibold text-ink"
                                            data-cy="index-p-58"
                                        >
                                            {record.trainee_name}
                                        </p>
                                        <p
                                            className="truncate text-xs text-neutral-500"
                                            data-cy="index-p-59"
                                        >
                                            {record.batch_code} · {record.date}
                                        </p>
                                    </div>
                                    <span
                                        className="shrink-0 font-mono text-xs font-medium text-ink"
                                        data-cy="index-span-h"
                                    >
                                        {record.total_hours}h
                                    </span>
                                </button>
                                <div
                                    className="mt-2 flex flex-wrap items-center gap-1"
                                    data-cy="index-div-61"
                                >
                                    {record.on_leave && (
                                        <span
                                            className="inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                                            data-cy="index-span-on-leave-2"
                                        >
                                            On Leave
                                        </span>
                                    )}
                                    {!record.on_leave &&
                                        record.exceptions.length > 0 && (
                                            <span
                                                className="inline-flex items-center gap-1 rounded-pill bg-danger-50 px-2 py-0.5 text-[11px] font-medium text-danger-800"
                                                data-cy="index-span-63"
                                            >
                                                <AlertTriangle
                                                    size={10}
                                                    data-cy="index-alert-triangle-64"
                                                />{' '}
                                                {missingPunchLabel(
                                                    record.exceptions,
                                                )}
                                            </span>
                                        )}
                                    {!record.on_leave &&
                                        record.exceptions.length === 0 && (
                                            <span
                                                className="text-[11px] text-neutral-500"
                                                data-cy="index-span-65"
                                            >
                                                {record.morning_time_in ?? '—'} –{' '}
                                                {record.day_time_out ?? '—'}
                                            </span>
                                        )}
                                </div>
                                <div
                                    className="mt-2.5 flex gap-2 border-t border-neutral-100 pt-2.5"
                                    data-cy="index-div-66"
                                >
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={Pencil}
                                        className="flex-1"
                                        onClick={() => setEditTarget(record)}
                                        data-cy="index-button-set-edit-target-2"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={Trash2}
                                        onClick={() => setDeleteTarget(record)}
                                        data-cy="index-button-set-delete-target"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {dailyRows.length === 0 && (
                            <div
                                className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400"
                                data-cy="index-div-no-biometric-records-match-your-search"
                            >
                                No biometric records match your search or
                                filters.
                            </div>
                        )}
                    </div>
                </>
            )}

            {!loading && tab === 'Trainee summary' && (
                <>
                    <div
                        className="no-print hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block"
                        data-cy="index-div-70"
                    >
                        <div
                            className="lss-scrollbar overflow-x-auto"
                            data-cy="index-div-71"
                        >
                            <table
                                className="w-full min-w-[760px] border-collapse text-sm"
                                data-cy="index-table-72"
                            >
                                <thead data-cy="index-thead-73">
                                    <tr
                                        className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                        data-cy="index-tr-74"
                                    >
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-full-name"
                                        >
                                            Full name
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-batch-2"
                                        >
                                            Batch
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-total-training-hours"
                                        >
                                            Total training hours
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="index-th-remarks-2"
                                        >
                                            Remarks
                                        </th>
                                        <th
                                            className="px-4 py-2.5 text-right font-medium"
                                            data-cy="index-th-actions-2"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody data-cy="index-tbody-81">
                                    {summaryRows.map((row) => (
                                        <tr
                                            key={row.traineeId}
                                            className="border-t border-neutral-100 transition-colors hover:bg-neutral-50"
                                            data-cy="index-tr-82"
                                        >
                                            <td
                                                className="px-4 py-2.5 font-medium text-ink"
                                                data-cy="index-td-83"
                                            >
                                                {row.trainee_name}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="index-td-85"
                                            >
                                                {row.batch_code}
                                            </td>
                                            <td
                                                className="px-4 py-2.5 font-mono text-xs font-medium text-ink"
                                                data-cy="index-td-h-2"
                                            >
                                                {row.totalHours}h
                                            </td>
                                            <td
                                                className="max-w-[240px] truncate px-4 py-2.5 text-xs text-neutral-500"
                                                title={summarizeAttendance(
                                                    row.records,
                                                )}
                                                data-cy="index-td-87"
                                            >
                                                {summarizeAttendance(row.records)}
                                            </td>
                                            <td
                                                className="px-4 py-2.5"
                                                data-cy="index-td-88"
                                            >
                                                <div
                                                    className="flex justify-end gap-0.5"
                                                    data-cy="index-div-89"
                                                >
                                                    <TooltipIconButton
                                                        icon={Eye}
                                                        label="Preview & print"
                                                        onClick={() =>
                                                            setPreviewTrainee({
                                                                name: row.trainee_name,
                                                                batchCode:
                                                                    row.batch_code ?? '',
                                                            })
                                                        }
                                                        data-cy="index-tooltip-icon-button-set-preview-trainee"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {summaryRows.length === 0 && (
                                        <tr data-cy="index-tr-91">
                                            <td
                                                colSpan={5}
                                                className="px-4 py-10 text-center text-xs text-neutral-400"
                                                data-cy="index-td-no-trainees-match-your-search-or"
                                            >
                                                No trainees match your search or
                                                filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile cards */}
                    <div
                        className="no-print flex flex-col gap-2 sm:hidden"
                        data-cy="index-div-93"
                    >
                        {summaryRows.map((row) => (
                            <button
                                key={row.traineeId}
                                onClick={() =>
                                    setPreviewTrainee({
                                        name: row.trainee_name,
                                        batchCode: row.batch_code ?? '',
                                    })
                                }
                                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 text-left transition-colors active:bg-neutral-50"
                                data-cy="index-button-set-preview-trainee"
                            >
                                <div
                                    className="min-w-0 flex-1"
                                    data-cy="index-div-95"
                                >
                                    <p
                                        className="truncate text-sm font-semibold text-ink"
                                        data-cy="index-p-96"
                                    >
                                        {row.trainee_name}
                                    </p>
                                    <p
                                        className="truncate text-xs text-neutral-500"
                                        data-cy="index-p-97"
                                    >
                                        {row.batch_code}
                                    </p>
                                    <p
                                        className="truncate text-xs text-neutral-400"
                                        data-cy="index-p-98"
                                    >
                                        {summarizeAttendance(row.records)}
                                    </p>
                                </div>
                                <span
                                    className="shrink-0 font-mono text-sm font-semibold text-ink"
                                    data-cy="index-span-h-2"
                                >
                                    {row.totalHours}h
                                </span>
                            </button>
                        ))}
                        {summaryRows.length === 0 && (
                            <div
                                className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400"
                                data-cy="index-div-no-trainees-match-your-search-or"
                            >
                                No trainees match your search or filters.
                            </div>
                        )}
                    </div>
                </>
            )}

            <ImportCsvModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                existingRecords={records}
                onConfirmImport={handleConfirmImport}
                data-cy="index-import-csv-modal-set-import-modal-open"
            />

            <EditRecordModal
                record={editTarget}
                onClose={() => setEditTarget(null)}
                onSave={handleSaveEdit}
                data-cy="index-edit-record-modal-set-edit-target"
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete attendance record"
                tone="danger"
                confirmLabel="Delete"
                description={
                    deleteTarget
                        ? `Delete the ${deleteTarget.date} attendance record for ${deleteTarget.trainee_name}? This cannot be undone.`
                        : ''
                }
                data-cy="index-confirm-dialog-delete-attendance-record"
            />

            {/* Import history log */}
            <Modal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                title="Import history"
                maxWidth={640}
                data-cy="index-modal-import-history"
            >
                <div
                    className="lss-scrollbar max-h-[60vh] overflow-y-auto"
                    data-cy="index-div-105"
                >
                    {sortedImports.length === 0 ? (
                        <p
                            className="py-8 text-center text-sm text-neutral-400"
                            data-cy="index-p-no-imports-yet"
                        >
                            No imports yet.
                        </p>
                    ) : (
                        <div
                            className="flex flex-col gap-2"
                            data-cy="index-div-107"
                        >
                            {sortedImports.map((imp) => (
                                <div
                                    key={imp.id}
                                    className="rounded-md border border-neutral-200 p-3"
                                    data-cy="index-div-108"
                                >
                                    <div
                                        className="mb-1 flex items-center justify-between gap-2"
                                        data-cy="index-div-109"
                                    >
                                        <span
                                            className="truncate text-sm font-medium text-ink"
                                            data-cy="index-span-110"
                                        >
                                            {imp.file_name}
                                        </span>
                                        <span
                                            className={cn(
                                                'shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                                IMPORT_STATUS_STYLE[imp.status],
                                            )}
                                            data-cy="index-span-111"
                                        >
                                            {IMPORT_STATUS_LABEL[imp.status]}
                                        </span>
                                    </div>
                                    <div
                                        className="text-xs text-neutral-500"
                                        data-cy="index-div-imported-by"
                                    >
                                        Imported by {imp.imported_by} on{' '}
                                        {imp.imported_at}
                                    </div>
                                    <div
                                        className="mt-1 text-xs text-neutral-500"
                                        data-cy="index-div-row"
                                    >
                                        {imp.total_rows} row
                                        {imp.total_rows === 1 ? '' : 's'} total —{' '}
                                        {imp.success_count} succeeded,{' '}
                                        {imp.error_count} error
                                        {imp.error_count === 1 ? '' : 's'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-end" data-cy="index-div-114">
                    <Button
                        variant="secondary"
                        onClick={() => setHistoryOpen(false)}
                        data-cy="index-button-set-history-open-2"
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            {/* Preview before printing */}
            <Modal
                open={!!previewTrainee}
                onClose={() => setPreviewTrainee(null)}
                title="Print preview"
                maxWidth={720}
                data-cy="index-modal-print-preview"
            >
                {previewTrainee && (
                    <div
                        className="flex flex-col gap-4"
                        data-cy="index-div-117"
                    >
                        <BiometricsPrint
                            variant="preview"
                            trainee={{
                                name: previewTrainee.name,
                                batchCode: previewTrainee.batchCode,
                            }}
                            records={previewRecords}
                            totalHours={previewTotalHours}
                            generatedAt={printGeneratedAt}
                            data-cy="index-biometrics-print-118"
                        />
                        <div
                            className="flex justify-end gap-2"
                            data-cy="index-div-119"
                        >
                            <Button
                                variant="secondary"
                                icon={X}
                                onClick={() => setPreviewTrainee(null)}
                                data-cy="index-button-set-preview-trainee-2"
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                icon={Printer}
                                onClick={() => window.print()}
                                data-cy="index-button-121"
                            >
                                Print
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {previewTrainee && (
                <BiometricsPrint
                    variant="print"
                    trainee={{
                        name: previewTrainee.name,
                        batchCode: previewTrainee.batchCode,
                    }}
                    records={previewRecords}
                    totalHours={previewTotalHours}
                    generatedAt={printGeneratedAt}
                    data-cy="index-biometrics-print-122"
                />
            )}
        </div>
    );
}
