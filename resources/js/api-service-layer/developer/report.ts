/**
 * @file api-service-layer/developer/report.ts
 * Reports are computed aggregations, not a CRUD resource — plain GET wrappers
 * over the summary/totals/export endpoints rather than createCrudResource().
 * `annualSummary`/`batchSummary` back <DataTableCardField> (paginated); the
 * totals endpoints aggregate over the whole filtered set independent of
 * pagination (for the stat cards); the export endpoints are unpaginated
 * (for the Print views, which must include every matching batch).
 */

import type { StatusKind } from '@/types';
import type { PaginatedResponse } from '@/types/reusable/pagination';
import { http, unwrap } from '../client';
import { buildQueryString } from '../form-data';

export interface ReportTrainee {
    id: number;
    name: string;
    school: string;
    requiredHrs: number;
    completedHrs: number;
    status: StatusKind;
    totalAmountPaid: number;
    outstandingBalance: number;
    netAmountDue: number;
}

export interface ReportFinancials {
    totalReceived: number;
    totalBalance: number;
    totalDue: number;
    traineeCount: number;
    completedCount: number;
    terminatedCount: number;
}

export interface ReportActivity {
    id: number;
    task: string;
    trainee: string;
    trainer: string;
    timeGoal: number;
    timeSpent: number;
    date: string;
}

export interface ReportBatch extends Record<string, unknown> {
    id: number;
    batchNo: string;
    programType: string;
    industry: string;
    setup: string;
    status: StatusKind;
    started: string;
    projectedEnd: string;
    createdDate: string;
    financials: ReportFinancials;
    trainees: ReportTrainee[];
    activities?: ReportActivity[];
}

export interface ReportQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    filters?: Record<string, unknown>;
}

export interface ReportTotals {
    financials: ReportFinancials;
    batchCount: number;
    seminarRevenue?: number;
}

export interface AnnualExportResponse {
    batches: ReportBatch[];
    seminarRevenue: number;
}

export interface BatchExportResponse {
    batches: ReportBatch[];
}

function query(params?: object): string {
    if (!params) {
        return '';
    }
    const qs = buildQueryString(params as Record<string, unknown>);
    return qs ? `?${qs}` : '';
}

export const reportService = {
    annualSummary: async (
        params: ReportQueryParams,
    ): Promise<PaginatedResponse<ReportBatch>> =>
        unwrap<PaginatedResponse<ReportBatch>>(
            await http.get(`/reports/annual/pagination-search${query(params)}`),
        ),
    annualTotals: async (
        filters: Record<string, unknown>,
        search: string,
    ): Promise<ReportTotals> =>
        unwrap<ReportTotals>(
            await http.get(`/reports/annual/totals${query({ filters, search: search || undefined })}`),
        ),
    annualExport: async (
        filters: Record<string, unknown>,
        search: string,
    ): Promise<AnnualExportResponse> =>
        unwrap<AnnualExportResponse>(
            await http.get(`/reports/annual/export${query({ filters, search: search || undefined })}`),
        ),
    batchSummary: async (
        params: ReportQueryParams,
    ): Promise<PaginatedResponse<ReportBatch>> =>
        unwrap<PaginatedResponse<ReportBatch>>(
            await http.get(`/reports/batch/pagination-search${query(params)}`),
        ),
    batchTotals: async (
        filters: Record<string, unknown>,
        search: string,
    ): Promise<ReportTotals> =>
        unwrap<ReportTotals>(
            await http.get(`/reports/batch/totals${query({ filters, search: search || undefined })}`),
        ),
    batchExport: async (
        filters: Record<string, unknown>,
        search: string,
    ): Promise<BatchExportResponse> =>
        unwrap<BatchExportResponse>(
            await http.get(`/reports/batch/export${query({ filters, search: search || undefined })}`),
        ),
};
