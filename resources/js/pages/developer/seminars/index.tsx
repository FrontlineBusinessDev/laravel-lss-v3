import { router } from '@inertiajs/react';
import { useState } from 'react';
import { seminarService } from '@/api-service-layer/developer/seminar';
import { RecordModal } from '@/components/table/components/RecordModal';
import { useToast } from '@/components/Toast';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { Seminar, SeminarParticipant } from '@/types';
import type { FieldDef } from '@/types/reusable/fields';
import { SeminarListTab } from './SeminarListTab';
import { ViewSeminarModal } from './ViewSeminarModal';

interface Props {
    seminars: Seminar[];
    participants: SeminarParticipant[];
}

const SEMINAR_TYPES = [
    'Technical & Automation Workshops',
    'Compliance & Softskills Seminars',
];

// Mirrors SeminarListController::storeRules()/updateRules(): topic/description/
// date/venue/type required; fee required numeric >= 0; max_participants
// nullable integer >= 1. Field keys match Seminar's own property names (so
// RecordModal seeds edit mode straight off the row); `max_participants` is
// only the wire name, handled in the payload mapping in onSubmit below.
const seminarFields: FieldDef<Seminar>[] = [
    {
        key: 'topic',
        label: 'Seminar topic',
        required: true,
        placeholder: 'e.g. AI Automation for HR',
        colSpan: 2,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Seminar description',
        colSpan: 2,
    },
    {
        key: 'type',
        label: 'Seminar track',
        type: 'select',
        required: true,
        options: SEMINAR_TYPES.map((t) => ({ value: t, label: t })),
        colSpan: 2,
    },
    { key: 'date', label: 'Date', type: 'date', required: true },
    {
        key: 'fee',
        label: 'Registration fee (PHP)',
        type: 'number',
        required: true,
        placeholder: '0',
        validate: (v) =>
            Number.isNaN(Number(v)) || Number(v) < 0
                ? 'Registration fee must be a number of 0 or more.'
                : undefined,
    },
    {
        key: 'venue',
        label: 'Venue / Platform',
        required: true,
        placeholder: 'Online or physical location',
        colSpan: 2,
    },
    {
        key: 'maxParticipants',
        label: 'Maximum participants',
        type: 'number',
        required: false,
        placeholder: 'Leave blank for unlimited',
        colSpan: 2,
        validate: (v) =>
            v !== '' &&
            v != null &&
            (!Number.isInteger(Number(v)) || Number(v) < 1)
                ? 'Maximum participants must be a whole number of 1 or more.'
                : undefined,
    },
];

/** Props are the single source of truth — every mutation reloads them via router.reload() rather than tracking a local copy. */
export default function SeminarsPage({ seminars, participants }: Props) {
    const { showToast } = useToast();
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Seminar | null>(null);
    const [viewing, setViewing] = useState<Seminar | null>(null);

    function reload() {
        router.reload({ only: ['seminars', 'participants'] });
    }

    function closeSeminarModal() {
        setCreateOpen(false);
        setEditing(null);
    }

    async function handleSave(values: Record<string, unknown>) {
        const payload = {
            topic: String(values.topic ?? ''),
            description: String(values.description ?? ''),
            date: String(values.date ?? ''),
            venue: String(values.venue ?? ''),
            fee: Number(values.fee) || 0,
            max_participants: values.maxParticipants
                ? Number(values.maxParticipants)
                : null,
            type: String(values.type ?? ''),
        };

        if (editing) {
            await seminarService.update(editing.id, payload);
            showToast('Seminar updated.', 'success');
        } else {
            await seminarService.create(payload);
            showToast('Seminar created.', 'success');
        }

        reload();
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

            {(createOpen || editing) && (
                <RecordModal<Seminar>
                    mode={editing ? 'edit' : 'create'}
                    row={editing ?? undefined}
                    fields={seminarFields}
                    title={editing ? 'Edit seminar' : 'Add seminar'}
                    onClose={closeSeminarModal}
                    onSubmit={async (values) => {
                        await handleSave(values);
                        closeSeminarModal();
                    }}
                    onError={(error) => showToast(error.message, 'error')}
                />
            )}

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
