import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { apiFetchJson } from '@/lib/apiFetch';
import type { DashboardAnnouncement } from '@/types/modules/dashboard/trainee-dashboard';

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function AnnouncementsCard({
    announcements: initial,
}: {
    announcements: DashboardAnnouncement[];
}) {
    const [announcements, setAnnouncements] = useState(initial);
    const [active, setActive] = useState<DashboardAnnouncement | null>(null);

    const open = (announcement: DashboardAnnouncement) => {
        setActive(announcement);
        if (!announcement.is_read) {
            setAnnouncements((prev) =>
                prev.map((a) =>
                    a.id === announcement.id ? { ...a, is_read: true } : a,
                ),
            );
            void apiFetchJson(`/trainee/announcements/${announcement.id}/read`, {
                method: 'POST',
            }).catch(() => {});
        }
    };

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
                <Megaphone size={16} className="text-brand-500" />
                <h2 className="text-sm font-semibold text-ink">
                    Announcements
                </h2>
            </div>
            {announcements.length === 0 ? (
                <p className="text-xs text-neutral-500">
                    No announcements for your batch.
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {announcements.map((announcement) => (
                        <li key={announcement.id}>
                            <button
                                type="button"
                                onClick={() => open(announcement)}
                                className="block w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="flex items-center gap-1.5">
                                    {!announcement.is_read && (
                                        <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
                                    )}
                                    <span
                                        className={
                                            announcement.is_read
                                                ? 'truncate text-sm text-neutral-600'
                                                : 'truncate text-sm font-semibold text-ink'
                                        }
                                    >
                                        {announcement.subject}
                                    </span>
                                </div>
                                <div className="mt-0.5 text-xs text-neutral-400">
                                    {formatDate(announcement.posted_at)}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

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
        </div>
    );
}
