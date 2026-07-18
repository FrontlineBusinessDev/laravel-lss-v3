import { CalendarOff } from 'lucide-react';
import type { DashboardOnLeave } from '@/types/modules/dashboard/trainee-dashboard';

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
    });
}

export function OnLeaveCard({ onLeave }: { onLeave: DashboardOnLeave[] }) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
                <CalendarOff size={16} className="text-brand-500" />
                <h2 className="text-sm font-semibold text-ink">
                    On leave
                </h2>
            </div>
            {onLeave.length === 0 ? (
                <p className="text-xs text-neutral-500">
                    No one on leave right now.
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {onLeave.map((entry) => (
                        <li
                            key={entry.id}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="text-ink">
                                {entry.trainee
                                    ? `${entry.trainee.first_name} ${entry.trainee.last_name}`
                                    : 'Unknown trainee'}
                            </span>
                            <span className="text-xs text-neutral-500">
                                {formatDate(entry.leave_date)} –{' '}
                                {formatDate(entry.return_date)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
