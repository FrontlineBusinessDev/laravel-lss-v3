/**
 * @file api-service-layer/developer/report.ts
 * Reports are computed aggregations, not a CRUD resource — plain GET wrappers
 * over the two summary endpoints rather than createCrudResource().
 */

import type { StatusKind } from '@/types';
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

export interface ReportBatch {
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

export interface ReportFilters {
    search?: string;
    date_from?: string;
    date_to?: string;
}

export interface AnnualSummaryResponse {
    batches: ReportBatch[];
    seminarRevenue: number;
}

export interface BatchSummaryResponse {
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
    annualSummary: async (filters: ReportFilters): Promise<AnnualSummaryResponse> =>
        unwrap<AnnualSummaryResponse>(
            await http.get(`/reports/annual/pagination-search${query(filters)}`),
        ),
    batchSummary: async (
        filters: ReportFilters & { academic_industry_id?: number },
    ): Promise<BatchSummaryResponse> =>
        unwrap<BatchSummaryResponse>(
            await http.get(`/reports/batch/pagination-search${query(filters)}`),
        ),
};
