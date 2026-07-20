/**
 * @file api-service-layer/admin/evaluation.ts
 * Admin Evaluation module — Overview metrics, Trainer/Seminar question bank
 * CRUD, and the evaluation-access-override toggle. Mirrors
 * api-service-layer/admin/behavioral-ratings.ts.
 */

import type {
    EvaluationBatchProgress,
    EvaluationOverrideCandidate,
    EvaluationOverviewMetrics,
    EvaluationReminderCandidate,
    EvaluationSeminarProgress,
    EvaluationSeminarQuestion,
    EvaluationTrainerCategories,
    EvaluationTrainerQuestion,
} from '@/types/modules/evaluation/evaluation';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

export type EvaluationQuestionInput = Partial<
    Pick<
        EvaluationTrainerQuestion,
        | 'question'
        | 'section'
        | 'type'
        | 'order'
        | 'is_critical'
        | 'status'
        | 'academic_industry_id'
    >
> & { category?: string };

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
    archiveRecord: async (
        type: 'trainer' | 'seminar',
        id: number,
    ): Promise<void> =>
        unwrap<void>(
            await http.patch(`/evaluation/overview/records/${type}/${id}/archive`),
        ),
    deleteRecord: async (
        type: 'trainer' | 'seminar',
        id: number,
    ): Promise<void> =>
        unwrap<void>(
            await http.delete(`/evaluation/overview/records/${type}/${id}`),
        ),
    batchProgress: async (): Promise<EvaluationBatchProgress[]> =>
        unwrap<EvaluationBatchProgress[]>(
            await http.get('/evaluation/overview/batch-progress'),
        ),
    seminarProgress: async (): Promise<EvaluationSeminarProgress[]> =>
        unwrap<EvaluationSeminarProgress[]>(
            await http.get('/evaluation/overview/seminar-progress'),
        ),
    reminders: async (): Promise<EvaluationReminderCandidate[]> =>
        unwrap<EvaluationReminderCandidate[]>(
            await http.get('/evaluation/overview/reminders'),
        ),
    notifyReminders: async (payload: {
        trainee_ids?: number[];
        email: boolean;
        chat: boolean;
    }): Promise<{ notified: number }> =>
        unwrap<{ notified: number }>(
            await http.post('/evaluation/overview/reminders/notify', payload),
        ),
};

export const evaluationQuestionCategoriesService = {
    trainerCategories: async (): Promise<EvaluationTrainerCategories> =>
        unwrap<EvaluationTrainerCategories>(
            await http.get('/evaluation/trainer-questionnaire/categories'),
        ),
    seminarCategories: async (): Promise<string[]> =>
        unwrap<string[]>(
            await http.get('/evaluation/seminar-questionnaire/categories'),
        ),
    trainerForCategory: async (params: {
        academic_industry_id: number;
        search?: string;
        status?: string;
    }): Promise<EvaluationTrainerQuestion[]> =>
        unwrap<EvaluationTrainerQuestion[]>(
            await http.get('/evaluation/trainer-questionnaire/for-category', {
                params,
            }),
        ),
    seminarForCategory: async (params: {
        category: string;
        search?: string;
        status?: string;
    }): Promise<EvaluationSeminarQuestion[]> =>
        unwrap<EvaluationSeminarQuestion[]>(
            await http.get('/evaluation/seminar-questionnaire/for-category', {
                params,
            }),
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
