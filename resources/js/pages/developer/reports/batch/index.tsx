import {
    ReportBatch,
    reportService,
} from '@/api-service-layer/developer/report';
import { Button } from '@/components/Button';
import { ColumnDef } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import { loadLookupOptions } from '@/types/reusable/fields';
import { Printer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BatchReportCard } from './BatchReportCard';
import { BatchReportPrint } from './BatchReportPrint';
import ReportsPrimaryLayout from '@/layouts/reports/ReportsPrimaryLayout';

const columns: ColumnDef<ReportBatch>[] = [
    {
        key: 'date_started',
        label: 'Date started',
        filterable: true,
        type: 'date-range',
    },
    {
        key: 'academic_industry_id',
        label: 'Industry',
        filterable: true,
        type: 'async-select',
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
    },
];

export default function BatchReportPage() {
    const { showToast } = useToast();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [activeFilters, setActiveFilters] = useState<{
        filters: Record<string, string | string[]>;
        search: string;
    }>({ filters: {}, search: '' });
    const [printBatches, setPrintBatches] = useState<ReportBatch[] | null>(
        null,
    );
    const refreshRef = useRef<(() => void) | undefined>(undefined);

    const dateFrom =
        typeof activeFilters.filters.date_started_from === 'string'
            ? activeFilters.filters.date_started_from
            : '';
    const dateTo =
        typeof activeFilters.filters.date_started_to === 'string'
            ? activeFilters.filters.date_started_to
            : '';
    const dateRangeLabel =
        dateFrom || dateTo
            ? `${dateFrom || 'Start'} – ${dateTo || 'Present'}`
            : 'All dates';
    const printGeneratedAt = useMemo(
        () =>
            new Date().toLocaleString('en-PH', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
        [printBatches],
    );

    useEffect(() => {
        if (printBatches) {
            window.print();
        }
    }, [printBatches]);

    const toggleExpand = (batchNo: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(batchNo)) next.delete(batchNo);
            else next.add(batchNo);
            return next;
        });
    };

    async function handlePrint() {
        const res = await reportService.batchExport(
            activeFilters.filters,
            activeFilters.search,
        );
        if (res.batches.length === 0) {
            showToast('No records to print for the current filters.', 'error');
            return;
        }
        setPrintBatches(res.batches);
    }

    return (
        <>
            <ReportsPrimaryLayout
                actionNode={
                    <div
                        className="no-print mb-2 flex items-center justify-end"
                        data-cy="batch-report-view-div-print"
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Printer}
                            onClick={handlePrint}
                            data-cy="batch-report-view-button-print"
                        >
                            Print
                        </Button>
                    </div>
                }
            >
                <DataTableCardField<ReportBatch>
                    apiUrl="/reports/batch"
                    apiQueryKey="reports-batch"
                    columns={columns}
                    enableCreate={false}
                    enableEdit={false}
                    defaultSortBy="date_started"
                    defaultSortDir="desc"
                    onRefreshRef={(fn) => (refreshRef.current = fn)}
                    onFiltersChange={(filters, search) =>
                        setActiveFilters({ filters, search })
                    }
                    renderCard={(batch) => (
                        <BatchReportCard
                            key={batch.id}
                            batch={batch}
                            isOpen={expanded.has(batch.batchNo)}
                            onToggle={() => toggleExpand(batch.batchNo)}
                        />
                    )}
                    data-cy="batch-report-view-data-table-field"
                />
            </ReportsPrimaryLayout>

            {printBatches && (
                <BatchReportPrint
                    batches={printBatches}
                    generatedAt={printGeneratedAt}
                    dateRangeLabel={dateRangeLabel}
                    data-cy="batch-report-view-batch-report-print"
                />
            )}
        </>
    );
}
