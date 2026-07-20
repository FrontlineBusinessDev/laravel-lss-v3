/**
 * @file api-service-layer/admin/evaluation.ts
 * Admin Evaluation module — Overview metrics, Trainer/Seminar question bank
 * CRUD, and the evaluation-access-override toggle. Mirrors
 * api-service-layer/admin/behavioral-ratings.ts.
 */

import type {
    EvaluationOverrideCandidate,
    EvaluationOverviewMetrics,
    EvaluationSeminarQuestion,
    EvaluationTrainerQuestion,
} from '@/types/modules/evaluation/evaluation';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

export type EvaluationQuestionInput = Partial<
    Pick<
        EvaluationTrainerQuestion,
        'question' | 'section' | 'type' | 'order' | 'is_critical' | 'status'
    >
>;

const trainerCrud = createCrudResource<
    EvaluationTrainerQuestion,
    EvaluationQuestionInput
>({
    baseUrl: '/evaluation/trainer-questionnaire',
});

const seminarCrud = createCrudResource<
    EvaluationSeminarQuestion,
    EvaluationQuestionInput
>({
    baseUrl: '/evaluation/seminar-questionnaire',
});

export const evaluationTrainerQuestionsService = {
    create: trainerCrud.create,
    update: trainerCrud.update,
    archive: trainerCrud.archive,
    restore: trainerCrud.restore,
    delete: trainerCrud.delete,
};

export const evaluationSeminarQuestionsService = {
    create: seminarCrud.create,
    update: seminarCrud.update,
    archive: seminarCrud.archive,
    restore: seminarCrud.restore,
    delete: seminarCrud.delete,
};

export const evaluationOverviewService = {
    metrics: async (): Promise<EvaluationOverviewMetrics> =>
        unwrap<EvaluationOverviewMetrics>(
            await http.get('/evaluation/overview/metrics'),
        ),
};

export const evaluationAccessOverrideService = {
    candidates: async (
        search = '',
    ): Promise<EvaluationOverrideCandidate[]> =>
        unwrap<EvaluationOverrideCandidate[]>(
            await http.get(
                `/trainees/evaluation-override-candidates${search ? `?search=${encodeURIComponent(search)}` : ''}`,
            ),
        ),
    toggle: async (
        traineeId: number,
        override: boolean,
    ): Promise<void> =>
        unwrap<void>(
            await http.patch(`/trainees/${traineeId}/evaluation-override`, {
                override,
            }),
        ),
};
