/**
 * @file types/modules/ratings/behavioral.ts
 * Real API shapes for the Behavioral Assessment Setup + Form tabs — replaces
 * the mock BehavioralQuestion/BehavioralRating/BehavioralAnswer types that
 * used to live in data/mockData.ts.
 */

export type BehavioralQuestionType = 'rating' | 'text';
export type BehavioralQuestionStatus = 'active' | 'inactive';

export interface BehavioralQuestion extends Record<string, unknown> {
    id: number;
    section: string;
    question: string;
    type: BehavioralQuestionType;
    order: number;
    is_critical: boolean;
    status: BehavioralQuestionStatus;
}

export interface BehavioralEvaluationAnswer {
    id: number;
    evaluation_id: number;
    question_id: number;
    score: number | null;
    text_answer: string | null;
}

export interface BehavioralEvaluationPerson {
    id: number;
    first_name: string;
    last_name: string;
}

export interface BehavioralEvaluation {
    id: number;
    batch_id: number;
    trainee_id: number;
    total_score: number | null;
    remarks: string | null;
    updated_at: string;
    trainee: BehavioralEvaluationPerson | null;
    evaluator: BehavioralEvaluationPerson | null;
    answers: BehavioralEvaluationAnswer[];
}

export interface BehavioralEvaluationTrainee {
    id: number;
    first_name: string;
    last_name: string;
    school: { id: number; school_name: string } | null;
}

/** Payload shape for POST /ratings/behavioral-rating/evaluation. */
export interface BehavioralEvaluationSubmission {
    batch_id: number;
    trainee_id: number;
    remarks: string | null;
    answers: Array<{
        question_id: number;
        score?: number | null;
        text_answer?: string | null;
    }>;
}
