/**
 * @file types/modules/evaluation/evaluation.ts
 * Real API shapes for the Admin Evaluation module (Overview, Trainer
 * Questionnaire, Seminar Questionnaire) — mirrors
 * types/modules/ratings/behavioral.ts.
 */

export type EvaluationQuestionType = 'rating' | 'text';
export type EvaluationQuestionStatus = 'active' | 'inactive';

export interface EvaluationTrainerQuestion extends Record<string, unknown> {
    id: number;
    section: string;
    question: string;
    type: EvaluationQuestionType;
    order: number;
    is_critical: boolean;
    status: EvaluationQuestionStatus;
}

export interface EvaluationSeminarQuestion extends Record<string, unknown> {
    id: number;
    section: string;
    question: string;
    type: EvaluationQuestionType;
    order: number;
    is_critical: boolean;
    status: EvaluationQuestionStatus;
}

export interface EvaluationOverviewMetrics {
    active_trainer_questions: number;
    active_seminar_questions: number;
    total_trainer_submissions: number;
    total_seminar_submissions: number;
    average_trainer_score: number | null;
    average_seminar_score: number | null;
    answers_by_batch: Array<{
        batch_id: number;
        batch_code: string;
        answer_count: number;
    }>;
    answers_by_seminar: Array<{
        seminar_id: number;
        topic: string;
        answer_count: number;
    }>;
}

export interface EvaluationOverrideCandidate {
    id: number;
    name: string;
    batch_code: string | null;
    missing_documents: string[];
    evaluation_access_override: boolean;
}
