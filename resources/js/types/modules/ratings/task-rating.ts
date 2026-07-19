/**
 * @file types/modules/ratings/task-rating.ts
 * Real API shapes for the Task Rating tab.
 */

export interface TaskRatingPerson {
    id: number;
    first_name: string;
    last_name: string;
}

export interface TaskRatingEntry {
    id: number;
    batch_id: number;
    task_name: string;
    trainee_id: number;
    rating: number;
    comments: string | null;
    description: string | null;
    hours_spent: string | null;
    rated_at: string;
    trainee: TaskRatingPerson | null;
    evaluator: TaskRatingPerson | null;
}

export interface TaskRatingHistoryApiEntry {
    rating: number;
    comments: string | null;
    rated_at: string;
    evaluator: TaskRatingPerson | null;
}

/** Payload shape for POST /ratings/task-rating/entries. */
export interface TaskRatingSubmission {
    batch_id: number | string;
    task_name: string;
    trainee_id: number;
    rating: number;
    comments: string;
    description: string;
    hours_spent: string | null;
}
