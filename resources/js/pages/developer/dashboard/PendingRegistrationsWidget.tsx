import { UserPlus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useNotifications } from '@/context/NotificationsContext';

/**
 * FYI-only admin widget for new public trainee registrations. "Pending" =
 * unread `registration.submitted` notifications — no separate approval
 * workflow/status on Trainees (see DashboardController::index()). Sourced
 * from the already-polled NotificationsContext, not a second data fetch.
 */
export function PendingRegistrationsWidget({
    pendingCount,
}: {
    pendingCount: number;
}) {
    const { notifications } = useNotifications();
    const recent = notifications
        .filter((n) => n.type === 'registration.submitted' && !n.read)
        .slice(0, 5);

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-brand-500" />
                    <h3 className="text-sm font-semibold text-ink">
                        Pending registrations
                    </h3>
                </div>
                <span className="inline-flex min-w-6 items-center justify-center rounded-pill bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                    {pendingCount}
                </span>
            </div>

            {recent.length === 0 ? (
                <p className="text-xs text-neutral-500">
                    No new registrations requiring action.
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {recent.map((n) => (
                        <li key={n.id}>
                            <Link
                                href={n.link ?? '/trainees'}
                                className="block rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-neutral-50"
                            >
                                <div className="font-medium text-ink">
                                    {n.title}
                                </div>
                                <div className="text-neutral-500">
                                    {n.body}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
