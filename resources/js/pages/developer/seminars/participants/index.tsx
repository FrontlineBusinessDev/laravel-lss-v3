import { useNotifications } from '@/context/NotificationsContext';
import {
    seminarAdminAlerts as initialAlerts,
    seminarParticipants as initialParticipants,
    seminars as initialSeminars,
    TODAY,
} from '@/data/mockData';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import { Seminar, SeminarAdminAlertSetting, SeminarParticipant } from '@/types';
import { useState } from 'react';
import { ParticipantsTab } from './ParticipantsTab';

export default function index() {
    const { notify } = useNotifications();
    const [seminars, setSeminars] = useState<Seminar[]>(initialSeminars);
    const [participants, setParticipants] =
        useState<SeminarParticipant[]>(initialParticipants);
    const [adminAlerts, setAdminAlerts] =
        useState<SeminarAdminAlertSetting[]>(initialAlerts);
    const [participantsTopicFilter, setParticipantsTopicFilter] = useState<
        string | undefined
    >();

    function handleUpdateParticipant(
        id: string,
        patch: Partial<SeminarParticipant>,
    ) {
        setParticipants((prev) => {
            const updated = prev.map((p) =>
                p.id === id
                    ? {
                          ...p,
                          ...patch,
                      }
                    : p,
            );
            if (
                patch.progress?.feedbackForm &&
                adminAlerts.find((a) => a.key === 'feedback_submitted')?.enabled
            ) {
                const p = updated.find((x) => x.id === id)!;
                notify({
                    audience: 'admin',
                    title: 'Feedback form submitted',
                    body: `${p.name} submitted their feedback form for "${p.seminarTopic}".`,
                    createdAt: TODAY.toISOString(),
                    link: '/seminars',
                });
            }
            return updated;
        });
    }

    return (
        <SeminarPrimaryLayout>
            <ParticipantsTab
                seminars={seminars}
                participants={participants}
                onUpdate={handleUpdateParticipant}
                initialTopicFilter={participantsTopicFilter}
                key={participantsTopicFilter ?? 'all'}
                data-cy="index-participants-tab-11"
            />
        </SeminarPrimaryLayout>
    );
}
