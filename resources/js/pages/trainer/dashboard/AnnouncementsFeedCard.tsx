import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { trainerDashboardService } from '@/api-service-layer/trainer/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { Modal } from '@/components/Modal';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import type { DashboardAnnouncement } from '@/types/modules/dashboard/trainer-dashboard';

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Bulletin-style announcements feed — own posts plus anything reaching this
 * trainer's assigned batches. Read-only: unlike the trainee dashboard, there
 * is no per-trainer read-tracking table to mark items read against.
 */
export function AnnouncementsFeedCard() {
    const { data, isLoading, error } = useDashboardWidget(
        () => trainerDashboardService.getAnnouncements(),
        [],
    );
    const rows = data ?? [];
    const [active, setActive] = useState<DashboardAnnouncement | null>(null);

    return (
        <DashboardWidgetCard
            title="Announcements"
            icon={Megaphone}
            isLoading={isLoading}
            error={error}
            isEmpty={rows.length === 0}
            emptyMessage="No announcements yet."
        >
            <ul className="flex flex-col gap-2">
                {rows.map((announcement) => (
                    <li key={announcement.id}>
                        <button
                            type="button"
                            onClick={() => setActive(announcement)}
                            className="block w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
                        >
                            <span className="truncate text-sm font-medium text-ink">
                                {announcement.subject}
                            </span>
                            <div className="mt-0.5 text-xs text-neutral-400">
                                {formatDate(announcement.posted_at)}
                            </div>
                        </button>
                    </li>
                ))}
            </ul>

            <Modal
                open={active !== null}
                onClose={() => setActive(null)}
                title={active?.subject ?? ''}
                description={formatDate(active?.posted_at ?? null)}
            >
                <p className="text-sm whitespace-pre-wrap text-neutral-700">
                    {active?.description || 'No further details.'}
                </p>
            </Modal>
        </DashboardWidgetCard>
    );
}
