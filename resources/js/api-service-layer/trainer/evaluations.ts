/**
 * @file api-service-layer/trainer/evaluations.ts
 * Trainer-portal Evaluation Overview — `/trainer/evaluation` (read-only,
 * batch-scoped server-side). Records themselves are fetched by
 * <DataTableCardField apiUrl="/trainer/evaluation" />, not this file.
 */

import type { TrainerEvaluationMetrics } from '@/types/modules/evaluation/trainer-evaluation';
import { http, unwrap } from '../client';

export const trainerEvaluationsService = {
    metrics: async (): Promise<TrainerEvaluationMetrics> =>
        unwrap<TrainerEvaluationMetrics>(
            await http.get('/trainer/evaluation/metrics'),
        ),
};
