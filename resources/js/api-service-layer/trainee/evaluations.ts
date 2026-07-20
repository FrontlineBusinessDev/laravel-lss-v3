/**
 * @file api-service-layer/trainee/evaluations.ts
 * Trainee-portal Trainer Evaluation gateway — `/trainee/evaluations`.
 */

import type {
    TrainerEvaluationGateway,
    TrainerEvaluationQuestion,
    TrainerEvaluationSubmission,
} from '@/types/modules/evaluation/trainer-evaluation';
import { http, unwrap } from '../client';

export const traineeEvaluationsService = {
    gateway: async (): Promise<TrainerEvaluationGateway> =>
        unwrap<TrainerEvaluationGateway>(
            await http.get('/trainee/evaluations/gateway'),
        ),
    activeQuestions: async (): Promise<TrainerEvaluationQuestion[]> =>
        unwrap<TrainerEvaluationQuestion[]>(
            await http.get('/trainee/evaluations/questions'),
        ),
    submit: async (
        payload: TrainerEvaluationSubmission,
    ): Promise<void> =>
        unwrap<void>(await http.post('/trainee/evaluations', payload)),
};
