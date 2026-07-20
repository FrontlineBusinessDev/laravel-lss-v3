import { useToast } from '@/components/Toast';
import { useNotifications } from '@/context/NotificationsContext';
import {
    seminarAdminAlerts as initialAlerts,
    seminarParticipants as initialParticipants,
    seminars as initialSeminars,
    seminarEmailTemplates as initialTemplates,
} from '@/data/mockData';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type {
    Seminar,
    SeminarAdminAlertSetting,
    SeminarEmailTemplate,
    SeminarParticipant,
} from '@/types';
import { useState } from 'react';
import { SeminarListTab } from './SeminarListTab';
const TABS = [
    'List of seminars',
    'Participants',
    'Email notifications',
] as const;
let seminarIdCounter = 100;
function slugLink(topic: string) {
    return `https://register.fbs-lss.com/seminars/${topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`;
}
export default function SeminarsPage() {
    const { showToast } = useToast();
    const { notify } = useNotifications();
    const [tab, setTab] = useState<(typeof TABS)[number]>('List of seminars');
    const [seminars, setSeminars] = useState<Seminar[]>(initialSeminars);
    const [participants, setParticipants] =
        useState<SeminarParticipant[]>(initialParticipants);
    const [templates, setTemplates] =
        useState<SeminarEmailTemplate[]>(initialTemplates);
    const [adminAlerts, setAdminAlerts] =
        useState<SeminarAdminAlertSetting[]>(initialAlerts);
    const [createOpen, setCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Seminar | null>(null);
    const [viewing, setViewing] = useState<Seminar | null>(null);
    const [participantsTopicFilter, setParticipantsTopicFilter] = useState<
        string | undefined
    >();
    function handleChangeStatus(id: string, status: Seminar['status']) {
        setSeminars((prev) =>
            prev.map((s) =>
                s.id === id
                    ? {
                          ...s,
                          status,
                      }
                    : s,
            ),
        );
    }
    return (
        <SeminarPrimaryLayout>
            <SeminarListTab
                seminars={seminars}
                onView={setViewing}
                onEdit={(s) => setEditing(s)}
                onChangeStatus={handleChangeStatus}
                data-cy="index-seminar-list-tab-10"
            />
        </SeminarPrimaryLayout>
    );
}
