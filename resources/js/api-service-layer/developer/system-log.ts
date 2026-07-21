/**
 * @file api-service-layer/developer/system-log.ts
 * Log deletion is a one-off action, not part of the CRUD surface — a plain
 * DELETE wrapper rather than createCrudResource().
 */

import { http, unwrap } from '../client';

export interface DeleteLogsRangePayload {
    current_password: string;
    created_at_from: string;
    created_at_to: string;
}

export interface DeleteLogsRangeResult {
    deleted: number;
}

export const systemLogService = {
    deleteRange: async (payload: DeleteLogsRangePayload): Promise<DeleteLogsRangeResult> =>
        unwrap<DeleteLogsRangeResult>(
            await http.delete('/system-log', { data: payload }),
        ),
};
