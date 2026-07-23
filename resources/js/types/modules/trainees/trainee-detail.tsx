/**
 * @file types/modules/trainees/trainee-detail.tsx
 * Shape of the `trainee` Inertia prop served by
 * `TraineesViewController::renderTab()` — nested `batch`/`school`/`documents`
 * relation objects, distinct from `AppTrainees` (the flat DataTable row shape
 * used by the trainees index).
 */
import type { CertificateTemplate } from '@/pages/developer/certificates/types';

export interface AppTraineeSchool {
    id: number;
    school_name: string;
}

export interface AppTraineeAcademicIndustry {
    id: number;
    name: string;
}

export interface AppTraineeAcademicProgram {
    id: number;
    name: string;
}

export interface AppTraineeAcademicLevel {
    id: number;
    name: string;
}

export interface AppTraineeBatch {
    id: number;
    batch_code: string;
    date_started: string | null;
    setup: 'F2F' | 'Online';
    academic_industry_id: number;
    academic_program_id: number;
    academic_industry?: AppTraineeAcademicIndustry;
    academic_program?: AppTraineeAcademicProgram;
}

export interface AppTraineeDocument {
    id: number;
    trainee_id: number;
    status: string;
    document_type: string;
    original_name: string | null;
    file_name: string | null;
    file_path: string | null;
    mime_type: string | null;
    url_link: string | null;
    file_size: number | null;
    created_at: string;
    view_url: string | null;
    download_url: string | null;
    file_missing?: boolean;
}

export interface AppTraineeLearningOutcome {
    id: number;
    title: string;
    status: 'active' | 'inactive';
}

export interface AppTraineePayment {
    id: number;
    trainee_id: number;
    amount_paid: string;
    payment_date: string;
    reference_no: string | null;
    notes: string | null;
    official_receipt_number: string | null;
    receipt_path: string | null;
    receipt_original_name: string | null;
    receipt_mime_type: string | null;
    receipt_size: number | null;
    receipt_view_url: string | null;
    receipt_download_url: string | null;
    created_at: string;
}

export interface AppTraineeUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
}

export interface AppTraineeCertificate {
    id: number;
    certificate_no: string;
    issued_at: string | null;
    citation: { id: number; title: string } | null;
    template?: CertificateTemplate | null;
}

export interface AppTraineeTaskRatingEvaluator {
    id: number;
    first_name: string;
    last_name: string;
}

export interface AppTraineeTaskRating {
    id: number;
    batch_id: number;
    task_name: string | null;
    rating: number | null;
    comments: string | null;
    rated_at: string | null;
    batch: { id: number; batch_code: string } | null;
    evaluator: AppTraineeTaskRatingEvaluator | null;
}

export interface AppTraineeBehavioralAnswer {
    id: number;
    question_id: number;
    score: number | null;
    text_answer: string | null;
    question: { id: number; section: string; question: string; type: 'rating' | 'text' } | null;
}

export interface AppTraineeBehavioralEvaluation {
    id: number;
    batch_id: number;
    total_score: number | null;
    remarks: string | null;
    updated_at: string;
    evaluator: AppTraineeTaskRatingEvaluator | null;
    answers: AppTraineeBehavioralAnswer[];
}

export interface TraineeDetail {
    id: number;
    status: string;
    user_id: number | null;
    user: AppTraineeUser | null;
    batch_id: number;
    school_id: number;
    academic_level_id: number | null;
    academic_level?: AppTraineeAcademicLevel;
    avatar_path: string | null;
    avatar_url: string | null;
    public_url_id: string;
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    birth_place: string;
    gender: 'male' | 'female';
    mobile_number: string;
    landline_number: string | null;
    emergency_contact_name: string;
    emergency_contact_number: string;
    // `decimal:2` casts — Eloquent serializes these as strings in JSON.
    required_hours: string;
    completed_hours: string | null;
    date_completed: string | null;
    termination_remarks: string | null;
    address: string;
    initials: string;
    name: string;
    school: AppTraineeSchool;
    batch: AppTraineeBatch;
    documents: AppTraineeDocument[];
    outcomes: AppTraineeLearningOutcome[];
    // `decimal:2` casts — Eloquent serializes these as strings in JSON. Null
    // override_* means "not overridden"; BillingService falls back to the
    // computed rate/discount tier lookup in that case.
    override_rate_per_hour: string | null;
    override_hours_discount_percent: string | null;
    override_group_discount_percent: string | null;
    applied_rate_per_hour: string;
    hours_discount_percent: string;
    group_discount_percent: string;
    gross_amount: string;
    total_discount_amount: string;
    net_amount_required: string;
    total_paid: string;
    outstanding_balance: string;
    payments: AppTraineePayment[];
    certificate: AppTraineeCertificate | null;
    task_ratings: AppTraineeTaskRating[];
    behavioral_evaluations: AppTraineeBehavioralEvaluation[];
    created_at: string;
    updated_at: string;
    tasks_sum_time_spent?: string | number | null;
}
