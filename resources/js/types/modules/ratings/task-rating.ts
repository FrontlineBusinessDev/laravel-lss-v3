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

/** A single edit captured in a task rating's audit trail (print/history view-model). */
export interface TaskRatingHistoryEntry {
    rating: number;
    comments: string;
    evaluator: string;
    ratedAt: string; // ISO date
}

/**
 * Print/report view-model for one trainee's rating on one task, built
 * client-side from the real `TaskRatingEntry` API row (see TaskRatingPage's
 * `toTaskRating()`).
 */
export interface TaskRating {
    id: string;
    batchNo: string;
    taskName: string;
    traineeId: string;
    traineeName: string;
    rating: number; // 1–100
    comments: string;
    evaluator: string;
    ratedAt: string; // ISO date of the most recent save
    history: TaskRatingHistoryEntry[];
}
