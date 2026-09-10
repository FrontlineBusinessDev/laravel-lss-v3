import { router } from '@inertiajs/react';
import { useState } from 'react';
import { seminarService } from '@/api-service-layer/developer/seminar';
import { useToast } from '@/components/Toast';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { Seminar, SeminarParticipant } from '@/types';
import { CreateEditSeminarModal } from './CreateEditSeminarModal';
import type { SeminarDraft as ModalDraft } from './CreateEditSeminarModal';
import { SeminarListTab } from './SeminarListTab';
import { ViewSeminarModal } from './ViewSeminarModal';

interface Props {
    seminars: Seminar[];
    participants: SeminarParticipant[];
}

/** Props are the single source of truth — every mutation reloads them via router.reload() rather than tracking a local copy. */
export default function SeminarsPage({ seminars, participants }: Props) {
    const { showToast } = useToast();
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Seminar | null>(null);
    const [viewing, setViewing] = useState<Seminar | null>(null);

    function reload() {
        router.reload({ only: ['seminars', 'participants'] });
    }

    async function handleSave(draft: ModalDraft, editingId?: string) {
        const payload = {
            topic: draft.topic,
            description: draft.description,
            date: draft.date,
            venue: draft.venue,
            fee: Number(draft.fee) || 0,
            max_participants: draft.maxParticipants
                ? Number(draft.maxParticipants)
                : null,
            type: draft.type,
        };

        try {
            if (editingId) {
                await seminarService.update(editingId, payload);
                showToast('Seminar updated.', 'success');
            } else {
                await seminarService.create(payload);
                showToast('Seminar created.', 'success');
            }

            reload();
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to save seminar.',
                'error',
            );
        }
    }

    async function handleChangeStatus(id: string, status: Seminar['status']) {
        try {
            if (status === 'completed') {
                await seminarService.complete(id);
            } else if (status === 'closed') {
                await seminarService.close(id);
            } else if (status === 'dissolved') {
                await seminarService.dissolve(id);
            }

            reload();
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update seminar status.',
                'error',
            );
        }
    }

    return (
        <SeminarPrimaryLayout
            seminarsCount={seminars.length}
            participantsCount={participants.length}
            actionNode={
                <button
                    onClick={() => setCreateOpen(true)}
                    className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500/90"
                >
                    Add seminar
                </button>
            }
        >
            <SeminarListTab
                seminars={seminars}
                onView={setViewing}
                onEdit={(s) => setEditing(s)}
                onChangeStatus={handleChangeStatus}
                data-cy="index-seminar-list-tab-10"
            />

            <CreateEditSeminarModal
                open={createOpen || !!editing}
                onClose={() => {
                    setCreateOpen(false);
                    setEditing(null);
                }}
                onSave={handleSave}
                editing={editing}
            />

            <ViewSeminarModal
                open={!!viewing}
                onClose={() => setViewing(null)}
                seminar={viewing}
                participants={participants}
                onViewParticipants={() =>
                    router.visit('/seminars/participants')
                }
            />
        </SeminarPrimaryLayout>
    );
}
