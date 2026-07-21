/**
 * @file types/modules/dashboard/admin-dashboard.ts
 * Payload shapes for the Admin/Developer dashboard widgets — each fetched
 * independently by its own component via adminDashboardService (see
 * api-service-layer/admin/dashboard.ts). Unscoped counterparts of the
 * trainer dashboard's shapes; row shapes identical to trainer's are
 * re-exported rather than duplicated.
 */

export type {
    UpcomingBatchEnd,
    OnLeaveTrainee,
    OngoingTask,
    OngoingTasksResponse,
    DocumentComplianceRow,
} from './trainer-dashboard';

export interface AdminDashboardMetrics {
    total_batches: number;
    active_batches: number;
    total_trainees: number;
    ongoing_trainees: number;
    total_earnings: number;
    average_rating: number;
    total_ratings: number;
}

export interface RecentBatch {
    id: number;
    batch_code: string;
    status: string;
    program_type: string | null;
}

export interface TraineeGrowthPoint {
    year: string;
    count: number;
}

export interface TraineeStatusBreakdown {
    active: number;
    completed: number;
    terminated: number;
    archived: number;
}

export interface AdminDashboardAnnouncement {
    id: number;
    subject: string;
    description: string | null;
    posted_at: string;
    posted_by: string | null;
}
