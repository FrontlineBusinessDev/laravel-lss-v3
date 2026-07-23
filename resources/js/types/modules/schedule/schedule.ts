/**
 * @file types/modules/schedule/schedule.ts
 * Payload shapes for the Admin/Developer Schedule module, passed as Inertia
 * props by ScheduleController::index() (see app/Support/Schedule/ScheduleEntryBuilder.php).
 */

import type { StatusKind } from '@/types/reusable/status-kind';

export interface ScheduleApiTrainee {
    id: number;
    name: string;
    school: string;
    academic_program: string | null;
    status: StatusKind;
}

export interface ScheduleApiBatch {
    id: number;
    batch_code: string;
    status: StatusKind;
    setup: string | null;
    date_started: string | null;
    projected_end_date: string | null;
    industry: string | null;
    program_type: string | null;
}

export interface ScheduleApiEntry {
    batch: ScheduleApiBatch;
    trainees: ScheduleApiTrainee[];
    start: string | null;
    end: string | null;
    school_counts: { school: string; count: number }[];
    primary_school: string;
    programs: string[];
}
