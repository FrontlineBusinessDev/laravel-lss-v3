/**
 * @file types/modules/dashboard/trainer-dashboard.ts
 * Payload shapes for the 7 trainer dashboard widgets — each fetched
 * independently by its own component via trainerDashboardService (see
 * api-service-layer/trainer/dashboard.ts).
 */

export interface DashboardMetrics {
    ongoing_trainees: number;
}

export interface UpcomingBatchEnd {
    batch_id: number;
    batch_code: string;
    projected_end_date: string | null;
    trainee_count: number;
}

export interface OnLeaveTrainee {
    trainee_id: number;
    name: string;
    batch_code: string | null;
    leave_type: string | null;
    return_date: string;
}

export interface OngoingTask {
    id: number;
    task: string;
    trainee_name: string;
    batch_code: string | null;
    date: string;
    status: string;
    priority: string | null;
}

export interface OngoingTasksResponse {
    tasks: OngoingTask[];
    total: number;
}

export interface DashboardAnnouncement {
    id: number;
    subject: string;
    description: string | null;
    posted_at: string;
}

export interface DocumentComplianceRow {
    trainee_id: number;
    name: string;
    batch_code: string | null;
    missing_types: string[];
}
