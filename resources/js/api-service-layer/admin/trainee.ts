/**
 * @file api-service-layer/admin/trainee.ts
 * Trainees service — `/trainees` (crudModule).
 */

import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { createCrudResource } from '../http';

export type TraineeInput = Partial<TraineeDetail>;

export const traineeService = createCrudResource<TraineeDetail, TraineeInput>({
    baseUrl: '/trainees',
});
