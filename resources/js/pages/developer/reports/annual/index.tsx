import {
    ReportBatch,
    reportService,
} from '@/api-service-layer/developer/report';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { ColumnDef } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import { useQuery } from '@tanstack/react-query';
import { Layers, Printer, Users2, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCurrency } from '../reportsUtils';
import { AnnualBatchCard } from './AnnualBatchCard';
import { AnnualReportPrint } from './AnnualReportPrint';
import ReportsPrimaryLayout from '@/layouts/reports/ReportsPrimaryLayout';

const columns: ColumnDef<ReportBatch>[] = [
    {
        key: 'date_started',
        label: 'Date started',
        filterable: true,
        type: 'date-range',
    },
];

export default function AnnualReportPage() {
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

    const { data: totals } = useQuery({
        queryKey: ['reports-annual-totals', activeFilters],
        queryFn: () =>
            reportService.annualTotals(
                activeFilters.filters,
                activeFilters.search,
            ),
    });

    const financials = totals?.financials;
    const seminarRevenue = totals?.seminarRevenue ?? 0;
    const batchCount = totals?.batchCount ?? 0;

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
        const res = await reportService.annualExport(
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
                        className="no-print flex items-center justify-end"
                        data-cy="annual-report-view-div-print"
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Printer}
                            onClick={handlePrint}
                            data-cy="annual-report-view-button-print"
                        >
                            Print
                        </Button>
                    </div>
                }
            >
                <div
                    className="no-print mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5"
                    data-cy="annual-report-view-div-stats"
                >
                    <StatCard
                        label="Batches"
                        value={batchCount}
                        icon={Layers}
                        data-cy="annual-report-view-stat-card-batches"
                    />
                    <StatCard
                        label="Trainees"
                        value={financials?.traineeCount ?? 0}
                        icon={Users2}
                        data-cy="annual-report-view-stat-card-trainees"
                    />
                    <StatCard
                        label="Total received"
                        value={formatCurrency(financials?.totalReceived ?? 0)}
                        icon={Wallet}
                        tone="success"
                        data-cy="annual-report-view-stat-card-total-received"
                    />
                    <StatCard
                        label="Total balance"
                        value={formatCurrency(financials?.totalBalance ?? 0)}
                        icon={Wallet}
                        tone={
                            (financials?.totalBalance ?? 0) > 0
                                ? 'warning'
                                : 'default'
                        }
                        data-cy="annual-report-view-stat-card-total-balance"
                    />
                    <StatCard
                        label="Seminar revenue"
                        value={formatCurrency(seminarRevenue)}
                        icon={Wallet}
                        tone="accent"
                        hint="All-time, tracked separately in Seminars"
                        data-cy="annual-report-view-stat-card-seminar-revenue"
                    />
                </div>

                <DataTableCardField<ReportBatch>
                    apiUrl="/reports/annual"
                    apiQueryKey="reports-annual"
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
                        <AnnualBatchCard
                            key={batch.id}
                            batch={batch}
                            isOpen={expanded.has(batch.batchNo)}
                            onToggle={() => toggleExpand(batch.batchNo)}
                        />
                    )}
                    data-cy="annual-report-view-data-table-field"
                />
            </ReportsPrimaryLayout>
            {printBatches && (
                <AnnualReportPrint
                    batches={printBatches}
                    generatedAt={printGeneratedAt}
                    dateRangeLabel={dateRangeLabel}
                    data-cy="annual-report-view-annual-report-print"
                />
            )}
        </>
    );
}
