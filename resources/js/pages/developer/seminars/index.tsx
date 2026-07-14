import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useNotifications } from '@/context/NotificationsContext';
import { seminars as initialSeminars, seminarParticipants as initialParticipants, seminarEmailTemplates as initialTemplates, seminarAdminAlerts as initialAlerts, TODAY, currentUser } from '@/data/mockData';
import type { Seminar, SeminarParticipant, SeminarEmailTemplate, SeminarAdminAlertSetting } from '@/types';
import { SeminarListTab } from './SeminarListTab';
import { ParticipantsTab } from './ParticipantsTab';
import { EmailNotificationsTab } from './EmailNotificationsTab';
import { CreateEditSeminarModal, SeminarDraft } from './CreateEditSeminarModal';
import { ViewSeminarModal } from './ViewSeminarModal';
import { cn } from '@/lib/utils';
const TABS = ['List of seminars', 'Participants', 'Email notifications'] as const;
let seminarIdCounter = 100;
function slugLink(topic: string) {
  return `https://register.fbs-lss.com/seminars/${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}
export default function SeminarsPage() {
  const {
    showToast
  } = useToast();
  const {
    notify
  } = useNotifications();
  const [tab, setTab] = useState<typeof TABS[number]>('List of seminars');
  const [seminars, setSeminars] = useState<Seminar[]>(initialSeminars);
  const [participants, setParticipants] = useState<SeminarParticipant[]>(initialParticipants);
  const [templates, setTemplates] = useState<SeminarEmailTemplate[]>(initialTemplates);
  const [adminAlerts, setAdminAlerts] = useState<SeminarAdminAlertSetting[]>(initialAlerts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Seminar | null>(null);
  const [viewing, setViewing] = useState<Seminar | null>(null);
  const [participantsTopicFilter, setParticipantsTopicFilter] = useState<string | undefined>();
  function handleSaveSeminar(draft: SeminarDraft, editingId?: string) {
    if (editingId) {
      setSeminars(prev => prev.map(s => s.id === editingId ? {
        ...s,
        topic: draft.topic,
        description: draft.description,
        date: draft.date,
        venue: draft.venue,
        fee: Number(draft.fee) || 0,
        maxParticipants: draft.maxParticipants ? Number(draft.maxParticipants) : undefined,
        type: draft.type
      } : s));
      showToast('Seminar updated successfully.', 'success');
      return;
    }
    const newSeminar: Seminar = {
      id: `sem${++seminarIdCounter}`,
      topic: draft.topic,
      description: draft.description,
      date: draft.date,
      venue: draft.venue,
      fee: Number(draft.fee) || 0,
      maxParticipants: draft.maxParticipants ? Number(draft.maxParticipants) : undefined,
      status: 'active',
      registeredCount: 0,
      type: draft.type,
      registrationLink: slugLink(draft.topic),
      createdAt: TODAY.toISOString().slice(0, 10)
    };
    setSeminars(prev => [newSeminar, ...prev]);
    showToast('Seminar created. Registration link is ready to share.', 'success');
  }
  function handleChangeStatus(id: string, status: Seminar['status']) {
    setSeminars(prev => prev.map(s => s.id === id ? {
      ...s,
      status
    } : s));
  }
  function handleUpdateParticipant(id: string, patch: Partial<SeminarParticipant>) {
    setParticipants(prev => {
      const updated = prev.map(p => p.id === id ? {
        ...p,
        ...patch
      } : p);
      if (patch.progress?.feedbackForm && adminAlerts.find(a => a.key === 'feedback_submitted')?.enabled) {
        const p = updated.find(x => x.id === id)!;
        notify({
          audience: 'admin',
          title: 'Feedback form submitted',
          body: `${p.name} submitted their feedback form for "${p.seminarTopic}".`,
          createdAt: TODAY.toISOString(),
          link: '/seminars'
        });
      }
      return updated;
    });
  }
  function handleUpdateTemplate(id: string, patch: Partial<SeminarEmailTemplate>) {
    setTemplates(prev => prev.map(t => t.id === id ? {
      ...t,
      ...patch
    } : t));
  }
  function handleToggleAlert(key: SeminarAdminAlertSetting['key']) {
    setAdminAlerts(prev => prev.map(a => a.key === key ? {
      ...a,
      enabled: !a.enabled
    } : a));
  }
  function jumpToParticipants(topic: string) {
    setParticipantsTopicFilter(topic);
    setViewing(null);
    setTab('Participants');
  }
  return <div data-cy="index-div-1">
      <div className="mb-4 flex items-center justify-between" data-cy="index-div-2">
        <div data-cy="index-div-3">
          <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-seminars">Seminars</h1>
          <p className="text-sm text-neutral-500" data-cy="index-p-seminars">
            {seminars.length} seminars · {participants.length} participants
          </p>
        </div>
        {tab === 'List of seminars' && <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)} data-cy="index-button-set-create-open">
            <span className="hidden sm:inline" data-cy="index-span-add-seminar">Add seminar</span>
          </Button>}
      </div>

      <div className="mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5 lss-scrollbar" data-cy="index-div-8">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('whitespace-nowrap pb-2.5 text-xs font-medium transition-colors', tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700')} data-cy="index-button-set-tab">
            {t}
          </button>)}
      </div>

      {tab === 'List of seminars' && <SeminarListTab seminars={seminars} onView={setViewing} onEdit={s => setEditing(s)} onChangeStatus={handleChangeStatus} data-cy="index-seminar-list-tab-10" />}

      {tab === 'Participants' && <ParticipantsTab seminars={seminars} participants={participants} onUpdate={handleUpdateParticipant} initialTopicFilter={participantsTopicFilter} key={participantsTopicFilter ?? 'all'} data-cy="index-participants-tab-11" />}

      {tab === 'Email notifications' && <EmailNotificationsTab templates={templates} onUpdateTemplate={handleUpdateTemplate} adminAlerts={adminAlerts} onToggleAlert={handleToggleAlert} data-cy="index-email-notifications-tab-12" />}

      <CreateEditSeminarModal open={createOpen || !!editing} onClose={() => {
      setCreateOpen(false);
      setEditing(null);
    }} onSave={handleSaveSeminar} editing={editing} data-cy="index-create-edit-seminar-modal-set-create-open" />

      <ViewSeminarModal open={!!viewing} onClose={() => setViewing(null)} seminar={viewing} participants={participants} onViewParticipants={jumpToParticipants} data-cy="index-view-seminar-modal-set-viewing" />

      <p className="mt-4 text-[11px] text-neutral-400" data-cy="index-p-signed-in-as">Signed in as {currentUser.name}.</p>
    </div>;
}