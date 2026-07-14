import { ConfirmDialog } from '@/components/ConfirmDialog';
import { buildRecordMenu, SettingsRow } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableField, { CardActions, ModalMode } from '@/components/table';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/context/BatchesContext';
import {
    currentUser,
    announcements as initialAnnouncements,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import { AddAnnouncementModal } from '@/pages/announcements/AddAnnouncementModal';
import type { StatusKind } from '@/types';
import {
    Announcements,
    columns,
    fields,
} from '@/types/modules/announcements/announcements';
import { Megaphone, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

const customGRID =
    'sm:grid-cols-[1.6fr_2.5rem] items-start! bg-white px-4 py-3.5 border-b-1 border-gray-100 mb-0! ';

const renderRow = (row: Announcements, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge=""
            menu={buildRecordMenu(actions, isArchived)}
        >
            <div
                key={row.id}
                className="flex items-start justify-between gap-3"
            >
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            row.status === 'archived'
                                ? 'bg-neutral-100 text-neutral-400'
                                : 'bg-brand-50 text-brand-600',
                        )}
                    >
                        <Megaphone size={14} />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    row.status === 'archived'
                                        ? 'text-neutral-400'
                                        : 'text-ink',
                                )}
                            >
                                {row.subject}
                            </span>
                            <StatusBadge status={badge} />
                        </div>
                        <p
                            className={cn(
                                'mt-0.5 max-w-xl text-xs',
                                row.status === 'archived'
                                    ? 'text-neutral-400'
                                    : 'text-neutral-500',
                            )}
                        >
                            {row.description}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Posted by {row.postedBy} ·{' '}
                            {new Date(row.created_at).toLocaleDateString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                },
                            )}
                            {' · '}
                            {audienceDetail(row)} · {row.audience} recipient
                            {Number(row.audience) === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>
            </div>
        </SettingsRow>
    );
};

type PendingAction = {
    type: 'archive' | 'restore' | 'delete';
    announcement: Announcements;
} | null;

// function resolveRecipientCount(
//     values: Pick<
//         AnnouncementFormValues,
//         'audience' | 'batchNo' | 'groupTraineeNames'
//     >,
//     trainees: Trainee[],
// ): number {
//     switch (values.audience) {
//         case 'All trainees':
//             return trainees.length;
//         case 'Specific batch':
//             return trainees.filter((t) => t.batchNo === values.batchNo).length;
//         case 'Trainees with incomplete documents':
//             return trainees.filter((t) => !t.documentsComplete).length;
//         case 'Custom group':
//             return values.groupTraineeNames.length;
//     }
// }

function audienceDetail(a: Announcements): string {
    if (a.audience === 'Specific batch')
        return `${a.audience} \u2013 ${a.batchNo}`;
    if (a.audience === 'Custom group') return `0 selected`;
    // if (a.audience === 'Custom group')
    //     return `${a.audience} \u2013 ${a.groupTraineeNames?.length ?? 0} selected`;
    return a.audience;
}

export default function AnnouncementsPage() {
    const { showToast } = useToast();
    const { trainees, batches } = useBatches();
    // ── Modal state ───────────────────────────────────────────────────────────
    const [modalState, setModalState] = useState<{
        mode: ModalMode;
        row?: Announcements;
    } | null>(null);

    const traineeNames = useMemo(
        () => Array.from(new Set(trainees.map((t) => t.name))).sort(),
        [trainees],
    );
    const batchNumbers = useMemo(
        () => batches.map((b) => b.batchNo),
        [batches],
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [items, setItems] = useState<Announcements[]>(initialAnnouncements);
    const [statusFilter, setStatusFilter] = useState('All statuses');
    const [pending, setPending] = useState<PendingAction>(null);

    const activeCount = items.filter((a) => a.status === 'active').length;

    // function handlePost(values: AnnouncementFormValues) {
    //     const recipientCount = resolveRecipientCount(values, trainees);
    //     const newAnnouncement: Announcement = {
    //         id: `an-${Date.now()}`,
    //         title: values.title.trim(),
    //         body: values.body.trim(),
    //         postedBy: currentUser.name,
    //         postedAt: toDateInputValue(TODAY),
    //         audience: values.audience,
    //         batchNo:
    //             values.audience === 'Specific batch'
    //                 ? values.batchNo
    //                 : undefined,
    //         groupTraineeNames:
    //             values.audience === 'Custom group'
    //                 ? values.groupTraineeNames
    //                 : undefined,
    //         recipientCount,
    //         status: 'active',
    //     };
    //     setItems((prev) => [newAnnouncement, ...prev]);
    //     setModalOpen(false);
    //     showToast(
    //         `"${newAnnouncement.title}" posted and emailed to ${recipientCount} trainee${recipientCount === 1 ? '' : 's'}.`,
    //         'success',
    //     );
    // }

    function runConfirmed() {
        if (!pending) return;
        const { type, announcement } = pending;
        if (type === 'archive') {
            setItems((prev) =>
                prev.map((a) =>
                    a.id === announcement.id ? { ...a, status: 'archived' } : a,
                ),
            );
            showToast(`"${announcement.title}" was archived.`, 'success');
        } else if (type === 'restore') {
            setItems((prev) =>
                prev.map((a) =>
                    a.id === announcement.id ? { ...a, status: 'active' } : a,
                ),
            );
            showToast(`"${announcement.title}" was restored.`, 'success');
        } else if (type === 'delete') {
            setItems((prev) => prev.filter((a) => a.id !== announcement.id));
            showToast(`"${announcement.title}" was deleted.`, 'error');
        }
        setPending(null);
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-ink">
                        Announcements
                    </h1>
                    <p className="text-sm text-neutral-500">
                        {activeCount} active of {items.length} total
                        announcements
                    </p>
                </div>
                {/* <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setModalState({ mode: 'create' })}
                >
                    New announcement
                </Button> */}
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                <span>
                    Signed in as <strong>{currentUser.name}</strong> (
                    {currentUser.role}). Admins can post to any audience and
                    archive, restore, or permanently delete any announcement.
                    Once a real login/session exists, non-admin roles should be
                    limited to posting and managing their own.
                </span>
            </div>

            <DataTableField<Announcements>
                apiUrl="/announcements"
                apiQueryKey="announcements"
                columns={columns}
                fields={fields}
                createLabel="Add Annoucement"
                modalTitle={(s) =>
                    s.mode === 'create' ? 'Add Annoucement' : 'Edit Annoucement'
                }
                // actions={false}
                defaultSortBy="first_name"
                createPermission="manage announcement"
                editPermission="manage announcement"
                archivePermission="manage announcement"
                deletePermission="manage announcement"
                renderCard={renderRow}
                renderModal={(m) => {
                    return (
                        <AddAnnouncementModal
                            open
                            mode={m.mode}
                            onClose={m.onClose}
                            onSubmit={m.onSubmit}
                            onSave={() => Promise<void>}
                        />
                    );
                }}
                // localModalState={modalState}
                // setLocalModalState={setModalState}
            />

            {pending && (
                <ConfirmDialog
                    open={!!pending}
                    onClose={() => setPending(null)}
                    onConfirm={runConfirmed}
                    title={
                        pending.type === 'archive'
                            ? 'Archive announcement'
                            : pending.type === 'restore'
                              ? 'Restore announcement'
                              : 'Delete announcement'
                    }
                    tone={pending.type === 'delete' ? 'danger' : 'default'}
                    confirmLabel={
                        pending.type === 'archive'
                            ? 'Archive'
                            : pending.type === 'restore'
                              ? 'Restore'
                              : 'Delete permanently'
                    }
                    description={
                        pending.type === 'archive'
                            ? `"${pending.announcement.title}" will be moved to archived records. You can restore it later. It will no longer count toward active announcements.`
                            : pending.type === 'restore'
                              ? `"${pending.announcement.title}" will be restored to active records.`
                              : `This permanently deletes "${pending.announcement.title}" and cannot be undone. Consider archiving instead if you may need it for reference.`
                    }
                />
            )}
        </div>
    );
}
