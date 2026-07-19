/**
 * @file api-service-layer/trainee/ratings.ts
 * Trainee self-service ratings — `/trainee/ratings`.
 */

import type { TraineeRatingMetrics } from '@/types/modules/ratings/trainee-task-rating';
import { http, unwrap } from '../client';

export const traineeRatingsService = {
    metrics: async (): Promise<TraineeRatingMetrics> =>
        unwrap<TraineeRatingMetrics>(
            await http.get('/trainee/ratings/metrics'),
        ),
};
