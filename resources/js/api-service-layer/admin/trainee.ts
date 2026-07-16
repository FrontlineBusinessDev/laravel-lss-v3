/**
 * @file api-service-layer/admin/trainee.ts
 * Trainees service — `/trainees` (crudModule).
 */

import type {
    AppTraineePayment,
    TraineeDetail,
} from '@/types/modules/trainees/trainee-detail';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

export type TraineeInput = Partial<TraineeDetail>;

export const traineeService = createCrudResource<TraineeDetail, TraineeInput>({
    baseUrl: '/trainees',
});

export interface TraineePaymentInput {
    amount_paid: string | number;
    payment_date: string;
    reference_no?: string | null;
    notes?: string | null;
}

/** Trainee-scoped payment log — not a top-level crudModule resource. */
export const traineePaymentsService = {
    create: async (
        traineeId: string | number,
        data: TraineePaymentInput,
    ): Promise<AppTraineePayment> =>
        unwrap<AppTraineePayment>(
            await http.post(`/trainees/${traineeId}/payments`, data),
        ),
    destroy: async (
        traineeId: string | number,
        paymentId: string | number,
    ): Promise<void> => {
        await http.delete(`/trainees/${traineeId}/payments/${paymentId}`);
    },
};

export interface TraineeBillingOverridePayload {
    override_rate_per_hour?: string | number | null;
    override_hours_discount_percent?: string | number | null;
    override_group_discount_percent?: string | number | null;
}

/**
 * Sets/clears a single billing override field. Uses a dedicated endpoint
 * (not traineeService.update) because the full trainee update route
 * requires every personal-info field to be present in the payload.
 */
export const traineeBillingOverrideService = {
    update: async (
        traineeId: string | number,
        data: TraineeBillingOverridePayload,
    ): Promise<TraineeDetail> =>
        unwrap<TraineeDetail>(
            await http.patch(`/trainees/${traineeId}/billing-overrides`, data),
        ),
};
