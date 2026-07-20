/**
 * @file types/modules/evaluation/trainer-evaluation.ts
 * Real API shapes for the Trainer-portal Evaluation Overview tab and the
 * Trainee-portal Trainer Evaluation submission gateway/form.
 */

import type { ColumnDef } from '@/types/reusable/data-table';

export interface TrainerEvaluationPerson {
    id: number;
    first_name: string;
    last_name: string;
}

/** Row shape returned by /trainer/evaluation/pagination-search. */
export interface TrainerEvaluationRow extends Record<string, unknown> {
    id: number;
    batch_id: number;
    total_score: number | null;
    remarks: string | null;
    submitted_at: string;
    trainee: TrainerEvaluationPerson | null;
    trainer: TrainerEvaluationPerson | null;
    batch: { id: number; batch_code: string } | null;
}

export interface TrainerEvaluationMetrics {
    total_submissions: number;
    average_score: number | null;
    answers_by_batch: Array<{
        batch_id: number;
        batch_code: string;
        answer_count: number;
    }>;
}

const traineeName = (row: TrainerEvaluationRow) =>
    row.trainee ? `${row.trainee.first_name} ${row.trainee.last_name}` : '—';

export const trainerEvaluationColumns: ColumnDef<TrainerEvaluationRow>[] = [
    {
        key: 'trainee',
        label: 'Trainee',
        render: (_value, row) => traineeName(row),
    },
    {
        key: 'batch',
        label: 'Batch',
        render: (value) => (value as { batch_code: string } | null)?.batch_code ?? '—',
    },
    {
        key: 'total_score',
        label: 'Score',
        sortable: true,
        render: (value) => (value != null ? `${value}/5` : '—'),
    },
    {
        key: 'remarks',
        label: 'Remarks',
        render: (value) => (value as string | null) ?? '—',
    },
    {
        key: 'submitted_at',
        label: 'Submitted',
        sortable: true,
        type: 'date-range',
        render: (value) => (value as string).slice(0, 10),
    },
];

/** A trainer assigned to the trainee's batch, for the trainer-picker step. */
export interface EvaluationTrainerOption {
    id: number;
    name: string;
    submitted: boolean;
}

/** Response shape for GET /trainee/evaluations/gateway. */
export interface TrainerEvaluationGateway {
    eligible: boolean;
    reasons: string[];
    trainers: EvaluationTrainerOption[];
}

export interface TrainerEvaluationQuestion {
    id: number;
    section: string;
    question: string;
    type: 'rating' | 'text';
    order: number;
}

/** Payload shape for POST /trainee/evaluations. */
export interface TrainerEvaluationSubmission {
    trainer_id: number;
    remarks: string | null;
    answers: Array<{
        question_id: number;
        score?: number | null;
        text_answer?: string | null;
    }>;
}
