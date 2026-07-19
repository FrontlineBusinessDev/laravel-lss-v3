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
