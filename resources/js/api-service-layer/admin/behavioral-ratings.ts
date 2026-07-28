/**
 * @file api-service-layer/admin/behavioral-ratings.ts
 * Behavioral Assessment Setup (`/ratings/behavioral-questions`) + Behavioral
 * Assessment Form (`/ratings/behavioral-rating`) services. Shared by the
 * admin and trainer Ratings pages (trainer requests 403 server-side on the
 * Setup endpoints — see routes/web.php).
 */

import type {
    BehavioralEvaluation,
    BehavioralEvaluationSubmission,
    BehavioralEvaluationTrainee,
    BehavioralQuestion,
} from '@/types/modules/ratings/behavioral';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

export type BehavioralQuestionInput = Partial<
    Pick<
        BehavioralQuestion,
        'question' | 'section' | 'type' | 'order' | 'is_critical' | 'status'
    >
>;

const crud = createCrudResource<BehavioralQuestion, BehavioralQuestionInput>({
    baseUrl: '/ratings/behavioral-questions',
});

export const behavioralQuestionsService = {
    /** Full question bank (small, non-paginated dataset) for the Setup tab.
     * BaseController::lookup() caps per_page at 50 — plenty for a question
     * bank of this size. */
    list: async (): Promise<BehavioralQuestion[]> =>
        unwrap<BehavioralQuestion[]>(
            await http.get(
                '/ratings/behavioral-questions/lookup?status=all&per_page=50',
            ),
        ),
    /** Distinct in-use sections (free text) — the Setup tab's grouping pills. */
    sections: async (): Promise<string[]> =>
        unwrap<string[]>(
            await http.get('/ratings/behavioral-questions/sections'),
        ),
    /** Full (non-paginated) ordered question list for one section. */
    forSection: async (params: {
        section: string;
        search?: string;
        status?: string;
    }): Promise<BehavioralQuestion[]> =>
        unwrap<BehavioralQuestion[]>(
            await http.get('/ratings/behavioral-questions/for-section', {
                params,
            }),
        ),
    /** Persists a drag-and-drop reorder — ids in their new display order. */
    reorder: async (ids: number[]): Promise<void> => {
        await http.post('/ratings/behavioral-questions/reorder', { ids });
    },
    create: crud.create,
    update: crud.update,
    archive: crud.archive,
    restore: crud.restore,
    delete: crud.delete,
};

export const behavioralEvaluationsService = {
    trainees: async (batchId: string | number): Promise<BehavioralEvaluationTrainee[]> =>
        unwrap<BehavioralEvaluationTrainee[]>(
            await http.get(`/ratings/behavioral-rating/trainees?batch_id=${batchId}`),
        ),
    activeQuestions: async (): Promise<BehavioralQuestion[]> =>
        unwrap<BehavioralQuestion[]>(
            await http.get('/ratings/behavioral-rating/questions'),
        ),
    forTrainee: async (
        batchId: string | number,
        traineeId: string | number,
    ): Promise<BehavioralEvaluation | null> =>
        unwrap<BehavioralEvaluation | null>(
            await http.get(
                `/ratings/behavioral-rating/evaluation?batch_id=${batchId}&trainee_id=${traineeId}`,
            ),
        ),
    submit: async (
        payload: BehavioralEvaluationSubmission,
    ): Promise<BehavioralEvaluation> =>
        unwrap<BehavioralEvaluation>(
            await http.post('/ratings/behavioral-rating/evaluation', payload),
        ),
};
