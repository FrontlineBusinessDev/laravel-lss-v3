export interface DashboardTrainee {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
}

export interface DashboardSummary {
    required_hours: number;
    completed_hours: number;
    batch_code: string | null;
    average_rating: number | null;
}

export interface DashboardTaskTrainer {
    id: number;
    first_name: string;
    last_name: string;
}

export interface DashboardTask {
    id: number;
    task: string;
    description: string | null;
    trainer_id: number | null;
    status: string;
    trainer: DashboardTaskTrainer | null;
}

export interface DashboardAnnouncement {
    id: number;
    subject: string;
    description: string | null;
    posted_at: string | null;
    is_read: boolean;
}

export interface DashboardLeavePeerTrainee {
    id: number;
    first_name: string;
    last_name: string;
}

export interface DashboardOnLeave {
    id: number;
    trainee_id: number;
    leave_date: string;
    return_date: string;
    trainee: DashboardLeavePeerTrainee | null;
}

export type EligibilityStatus =
    | 'eligible'
    | 'pending_requirements'
    | 'outstanding_balance'
    | 'not_eligible';

export interface DashboardEligibility {
    status: EligibilityStatus;
    reasons: string[];
}

export interface TraineeDashboardProps {
    trainee: DashboardTrainee;
    summary: DashboardSummary;
    ongoingTasks: DashboardTask[];
    announcements: DashboardAnnouncement[];
    onLeave: DashboardOnLeave[];
    eligibility: DashboardEligibility;
}
