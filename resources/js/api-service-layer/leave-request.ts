/**
 * @file api-service-layer/leave-request.ts
 * Leave requests service — `/leave` (bespoke: no archive/restore/update, since
 * the lifecycle is pending -> approved|declined via dedicated actions).
 */

import type {
    CrudQueryParams,
    PaginatedResponse,
} from '@/types/reusable/pagination';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { http, unwrap } from './client';
import { buildFormData, buildQueryString, hasBinaryFiles } from './form-data';

export interface LeaveRequestInput extends Record<string, unknown> {
    leave_category_id: number | string;
    leave_date: string;
    return_date: string;
    reason: string;
    document?: File | null;
}

function query(params?: Record<string, unknown>): string {
    if (!params) {
        return '';
    }
    const qs = buildQueryString(params);

    return qs ? `?${qs}` : '';
}

export const leaveRequestService = {
    getPaginatedFilterSearch: async (
        params?: CrudQueryParams,
    ): Promise<PaginatedResponse<LeaveRequests>> =>
        unwrap<PaginatedResponse<LeaveRequests>>(
            await http.get(`/leave/pagination-search${query(params)}`),
        ),

    submit: async (data: LeaveRequestInput): Promise<LeaveRequests> =>
        unwrap<LeaveRequests>(
            await http.post(
                '/leave',
                hasBinaryFiles(data) ? buildFormData(data) : data,
            ),
        ),

    approve: async (id: number | string): Promise<LeaveRequests> =>
        unwrap<LeaveRequests>(await http.patch(`/leave/${id}/approve`)),

    decline: async (
        id: number | string,
        decisionRemarks?: string,
    ): Promise<LeaveRequests> =>
        unwrap<LeaveRequests>(
            await http.patch(`/leave/${id}/decline`, {
                decision_remarks: decisionRemarks,
            }),
        ),

    delete: async (id: number | string): Promise<null> =>
        unwrap<null>(await http.delete(`/leave/${id}`)),
};
