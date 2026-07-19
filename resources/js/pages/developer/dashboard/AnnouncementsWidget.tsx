import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { DashboardWidgetCard } from '@/components/dashboard/DashboardWidgetCard';
import { Modal } from '@/components/Modal';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import type { AdminDashboardAnnouncement } from '@/types/modules/dashboard/admin-dashboard';

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/** Bulletin-style feed of the latest active system announcements. */
export function AnnouncementsWidget() {
    const { data, isLoading, error } = useDashboardWidget(
        () => adminDashboardService.getAnnouncements(),
        [],
    );
    const rows = data ?? [];
    const [active, setActive] = useState<AdminDashboardAnnouncement | null>(
        null,
    );

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
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium text-ink">
                                    {announcement.subject}
                                </span>
                                <span className="shrink-0 text-xs text-neutral-400">
                                    {formatDate(announcement.posted_at)}
                                </span>
                            </div>
                            {announcement.posted_by && (
                                <div className="mt-0.5 text-xs text-neutral-400">
                                    Posted by {announcement.posted_by}
                                </div>
                            )}
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
