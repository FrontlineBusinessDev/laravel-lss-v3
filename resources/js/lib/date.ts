/**
 * @file lib/date.ts
 * Canonical date/datetime formatting for the app. Every display of a date
 * or timestamp should go through these functions instead of ad-hoc
 * `toLocaleDateString`/`toLocaleString`/`.slice(0,10)` calls, so formatting
 * stays consistent across tables, cards, dashboards, and print views.
 */

export type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
    if (value === null || value === undefined || value === '') return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Date-only, e.g. "Jul 28, 2026". en-PH medium style — the pattern already
 * dominant across the dashboard widgets. Use for date_started,
 * projected_end_date, payment_date, leave_date, and similar YYYY-MM-DD
 * fields.
 */
export function formatDate(value: DateInput, fallback = '—'): string {
    const date = toDate(value);
    if (!date) return fallback;
    return date.toLocaleDateString('en-PH', { dateStyle: 'medium' });
}

/**
 * Date + time, e.g. "Jul 28, 2026, 3:45 PM". Matches the
 * toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
 * pattern already used consistently across every "Generated at"
 * print/report footer. Use for created_at, submitted_at, rated_at,
 * notified_at, and other timestamp fields.
 */
export function formatDateTime(value: DateInput, fallback = '—'): string {
    const date = toDate(value);
    if (!date) return fallback;
    return date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

/**
 * en-US short numeric style, e.g. "07/28/2026" — like-for-like replacement
 * for the handful of call sites that previously rendered this style
 * locally (date-picker display fields, etc.), kept separate so migrating
 * them doesn't silently change their visible output.
 */
export function formatDateShort(value: DateInput, fallback = '—'): string {
    const date = toDate(value);
    if (!date) return fallback;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
