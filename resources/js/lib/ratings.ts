/**
 * @file lib/ratings.ts
 * Shared hours-completion math for the trainee Ratings tabs. `required_hours`/
 * `completed_hours` are `decimal:2` Eloquent casts, serialized as strings (or
 * null) in JSON — every caller must coerce before comparing/dividing.
 */
export interface HoursProgress {
    completed: number;
    required: number;
    percent: number;
    hoursComplete: boolean;
}

export function getHoursProgress(
    completedHours: string | number | null | undefined,
    requiredHours: string | number | null | undefined,
): HoursProgress {
    const completed = Number(completedHours) || 0;
    const required = Number(requiredHours) || 0;
    const percent =
        required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;

    return {
        completed,
        required,
        percent,
        hoursComplete: required > 0 && completed >= required,
    };
}
