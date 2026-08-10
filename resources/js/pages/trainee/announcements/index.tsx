import { useState } from 'react';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { traineeAnnouncementsService } from '@/api-service-layer/trainee/announcements';
import { formatDate } from '@/lib/date';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import type { DashboardAnnouncement } from '@/types/modules/dashboard/trainee-dashboard';

export default function index() {
    const [page, setPage] = useState(1);
    const [active, setActive] = useState<DashboardAnnouncement | null>(null);
    const [readIds, setReadIds] = useState<Set<number>>(new Set());

    const { data, isLoading, error } = useDashboardWidget(
        () => traineeAnnouncementsService.list({ page, per_page: 15 }),
        [page],
    );

    const announcements = data?.data ?? [];
    const meta = data?.meta;

    function open(announcement: DashboardAnnouncement) {
        setActive(announcement);
        if (!announcement.is_read && !readIds.has(announcement.id)) {
            setReadIds((prev) => new Set(prev).add(announcement.id));
            void traineeAnnouncementsService.markRead(announcement.id).catch(() => {});
        }
    }

    return (
        <TraineeLayout title="Announcements" description="Broadcasts to all trainees, your batch, or you specifically.">
            <div className="rounded-lg border border-neutral-200 bg-white p-4" data-cy="trainee-announcements-div-1">
                {error && (
                    <p className="mb-3 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs text-danger-700" data-cy="trainee-announcements-p-error">
                        {error}
                    </p>
                )}

                {isLoading && (
                    <p className="py-8 text-center text-sm text-neutral-400" data-cy="trainee-announcements-p-loading">
                        Loading announcements…
                    </p>
                )}

                {!isLoading && announcements.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center" data-cy="trainee-announcements-div-empty">
                        <Megaphone size={22} className="text-neutral-300" />
                        <p className="text-sm text-neutral-500">No announcements yet.</p>
                    </div>
                )}

                {!isLoading && announcements.length > 0 && (
                    <ul className="flex flex-col divide-y divide-neutral-100" data-cy="trainee-announcements-ul-list">
                        {announcements.map((announcement) => (
                            <li key={announcement.id}>
                                <button
                                    type="button"
                                    onClick={() => open(announcement)}
                                    className="block w-full px-2 py-3 text-left transition-colors hover:bg-neutral-50"
                                    data-cy="trainee-announcements-button-row"
                                >
                                    <div className="flex items-center gap-1.5">
                                        {!announcement.is_read && !readIds.has(announcement.id) && (
                                            <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
                                        )}
                                        <span
                                            className={
                                                announcement.is_read || readIds.has(announcement.id)
                                                    ? 'truncate text-sm text-neutral-600'
                                                    : 'truncate text-sm font-semibold text-ink'
                                            }
                                        >
                                            {announcement.subject}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 truncate text-xs text-neutral-500">{announcement.description}</p>
                                    <div className="mt-0.5 text-xs text-neutral-400">{formatDate(announcement.posted_at)}</div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-xs text-neutral-500" data-cy="trainee-announcements-div-pagination">
                        <span>
                            Page {meta.current_page} of {meta.last_page} · {meta.total} total
                        </span>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={meta.current_page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                                data-cy="trainee-announcements-button-prev-page"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                type="button"
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                                data-cy="trainee-announcements-button-next-page"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                open={active !== null}
                onClose={() => setActive(null)}
                title={active?.subject ?? ''}
                description={formatDate(active?.posted_at ?? null)}
                data-cy="trainee-announcements-modal-detail"
            >
                <p className="text-sm whitespace-pre-wrap text-neutral-700">{active?.description || 'No further details.'}</p>
            </Modal>
        </TraineeLayout>
    );
}
