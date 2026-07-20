/**
 * @file types/modules/evaluation/evaluation.ts
 * Real API shapes for the Admin Evaluation module (Overview, Trainer
 * Questionnaire, Seminar Questionnaire) — mirrors
 * types/modules/ratings/behavioral.ts.
 */

export type EvaluationQuestionType = 'rating' | 'text';
export type EvaluationQuestionStatus = 'active' | 'inactive';

export interface EvaluationQuestionCreator {
    id: number;
    first_name: string;
    last_name: string;
}

export interface EvaluationTrainerQuestion extends Record<string, unknown> {
    id: number;
    section: string;
    question: string;
    academic_industry_id: number | null;
    type: EvaluationQuestionType;
    order: number;
    is_critical: boolean;
    status: EvaluationQuestionStatus;
    created_at: string;
    creator?: EvaluationQuestionCreator | null;
}

export interface EvaluationSeminarQuestion extends Record<string, unknown> {
    id: number;
    section: string;
    question: string;
    category: string | null;
    type: EvaluationQuestionType;
    order: number;
    is_critical: boolean;
    status: EvaluationQuestionStatus;
    created_at: string;
    creator?: EvaluationQuestionCreator | null;
}

export interface EvaluationTrainerCategory {
    id: number;
    name: string;
}

export interface EvaluationTrainerCategories {
    in_use: EvaluationTrainerCategory[];
    available: EvaluationTrainerCategory[];
}

export interface EvaluationOverviewMetrics {
    active_trainer_questions: number;
    active_seminar_questions: number;
    total_trainer_submissions: number;
    total_seminar_submissions: number;
    average_trainer_score: number | null;
    average_seminar_score: number | null;
    rating_distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
    answers_by_batch: Array<{
        batch_id: number;
        batch_code: string;
        answer_count: number;
        average_score: number | null;
    }>;
    answers_by_seminar: Array<{
        seminar_id: number;
        topic: string;
        answer_count: number;
        average_score: number | null;
    }>;
}

export interface EvaluationOverrideCandidate {
    id: number;
    name: string;
    batch_code: string | null;
    missing_documents: string[];
    evaluation_access_override: boolean;
}

export interface EvaluationRecordRow extends Record<string, unknown> {
    id: number;
    type: 'trainer' | 'seminar';
    respondent: string;
    evaluated: string;
    scope_label: string;
    scope_detail: string;
    score: number | null;
    submitted_at: string;
    archived_at: string | null;
    locked: boolean;
}

export interface EvaluationBatchProgress {
    batch_id: number;
    batch_code: string;
    status: string;
    label: string;
    submitted: number;
    expected: number;
}

export interface EvaluationSeminarProgress {
    seminar_id: number;
    topic: string;
    status: string;
    submitted: number;
    expected: number;
}

export interface EvaluationReminderCandidate {
    trainee_id: number;
    name: string;
    batch_code: string | null;
}
