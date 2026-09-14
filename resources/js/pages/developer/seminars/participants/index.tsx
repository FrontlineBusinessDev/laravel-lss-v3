import { router } from '@inertiajs/react';
import { seminarService } from '@/api-service-layer/developer/seminar';
import { useToast } from '@/components/Toast';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { Seminar, SeminarParticipant } from '@/types';
import { ParticipantsTab } from '../ParticipantsTab';

interface Props {
    seminars: Seminar[];
    participants: SeminarParticipant[];
}

/** Props are the single source of truth — every update reloads them via router.reload(). */
export default function SeminarParticipantsPage({
    seminars,
    participants,
}: Props) {
    const { showToast } = useToast();

    async function handleUpdate(
        id: string,
        patch: Partial<SeminarParticipant>,
    ) {
        try {
            await seminarService.updateParticipant(id, patch);
            router.reload({ only: ['participants'] });
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update participant.',
                'error',
            );
        }
    }

    return (
        <SeminarPrimaryLayout
            seminarsCount={seminars.length}
            participantsCount={participants.length}
        >
            <ParticipantsTab
                seminars={seminars}
                participants={participants}
                onUpdate={handleUpdate}
            />
        </SeminarPrimaryLayout>
    );
}
