import { useMemo, useState } from 'react';
import { Plus, Archive, ArchiveRestore, Trash2, Megaphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { RowMenu } from '@/components/RowMenu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { announcements as initialAnnouncements, TODAY, currentUser } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type { Announcement, Trainee } from '@/types';
import { cn, toDateInputValue } from '@/lib/utils';
import { AddAnnouncementModal, type AnnouncementFormValues } from '@/pages/developer/announcements/AddAnnouncementModal';
type PendingAction = {
  type: 'archive' | 'restore' | 'delete';
  announcement: Announcement;
} | null;
function resolveRecipientCount(values: Pick<AnnouncementFormValues, 'audience' | 'batchNo' | 'groupTraineeNames'>, trainees: Trainee[]): number {
  switch (values.audience) {
    case 'All trainees':
      return trainees.length;
    case 'Specific batch':
      return trainees.filter(t => t.batchNo === values.batchNo).length;
    case 'Trainees with incomplete documents':
      return trainees.filter(t => !t.documentsComplete).length;
    case 'Custom group':
      return values.groupTraineeNames.length;
  }
}
function audienceDetail(a: Announcement): string {
  if (a.audience === 'Specific batch') return `${a.audience} \u2013 ${a.batchNo}`;
  if (a.audience === 'Custom group') return `${a.audience} \u2013 ${a.groupTraineeNames?.length ?? 0} selected`;
  return a.audience;
}
export default function AnnouncementsPage() {
  const {
    showToast
  } = useToast();
  const {
    trainees,
    batches
  } = useBatches();
  const traineeNames = useMemo(() => Array.from(new Set(trainees.map(t => t.name))).sort(), [trainees]);
  const batchNumbers = useMemo(() => batches.map(b => b.batchNo), [batches]);
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [pending, setPending] = useState<PendingAction>(null);
  const filtered = useMemo(() => {
    return items.filter(a => statusFilter === 'All statuses' || a.status === statusFilter.toLowerCase()).sort((a, b) => a.postedAt < b.postedAt ? 1 : -1);
  }, [items, statusFilter]);
  const activeCount = items.filter(a => a.status === 'active').length;
  function handlePost(values: AnnouncementFormValues) {
    const recipientCount = resolveRecipientCount(values, trainees);
    const newAnnouncement: Announcement = {
      id: `an-${Date.now()}`,
      title: values.title.trim(),
      body: values.body.trim(),
      postedBy: currentUser.name,
      postedAt: toDateInputValue(TODAY),
      audience: values.audience,
      batchNo: values.audience === 'Specific batch' ? values.batchNo : undefined,
      groupTraineeNames: values.audience === 'Custom group' ? values.groupTraineeNames : undefined,
      recipientCount,
      status: 'active'
    };
    setItems(prev => [newAnnouncement, ...prev]);
    setModalOpen(false);
    showToast(`"${newAnnouncement.title}" posted and emailed to ${recipientCount} trainee${recipientCount === 1 ? '' : 's'}.`, 'success');
  }
  function runConfirmed() {
    if (!pending) return;
    const {
      type,
      announcement
    } = pending;
    if (type === 'archive') {
      setItems(prev => prev.map(a => a.id === announcement.id ? {
        ...a,
        status: 'archived'
      } : a));
      showToast(`"${announcement.title}" was archived.`, 'success');
    } else if (type === 'restore') {
      setItems(prev => prev.map(a => a.id === announcement.id ? {
        ...a,
        status: 'active'
      } : a));
      showToast(`"${announcement.title}" was restored.`, 'success');
    } else if (type === 'delete') {
      setItems(prev => prev.filter(a => a.id !== announcement.id));
      showToast(`"${announcement.title}" was deleted.`, 'error');
    }
    setPending(null);
  }
  return <div data-cy="index-div-1">
      <div className="mb-4 flex items-center justify-between" data-cy="index-div-2">
        <div data-cy="index-div-3">
          <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-announcements">Announcements</h1>
          <p className="text-sm text-neutral-500" data-cy="index-p-active-of">{activeCount} active of {items.length} total announcements</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)} data-cy="index-button-set-modal-open">
          New announcement
        </Button>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700" data-cy="index-div-7">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" data-cy="index-shield-check-8" />
        <span data-cy="index-span-signed-in-as">
          Signed in as <strong data-cy="index-strong-10">{currentUser.name}</strong> ({currentUser.role}). Admins can post to any audience and archive, restore, or permanently delete any
          announcement. Once a real login/session exists, non-admin roles should be limited to posting and managing their own.
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between" data-cy="index-div-11">
        <div className="w-44" data-cy="index-div-12">
          <Dropdown options={['All statuses', 'Active', 'Archived']} value={statusFilter} onChange={setStatusFilter} data-cy="index-dropdown-set-status-filter" />
        </div>
        <span className="text-xs text-neutral-400" data-cy="index-span-of">{filtered.length} of {items.length}</span>
      </div>

      <div className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200 bg-white" data-cy="index-div-15">
        {filtered.map(a => <div key={a.id} className="flex items-start justify-between gap-3 px-4 py-3.5" data-cy="index-div-16">
            <div className="flex items-start gap-3" data-cy="index-div-17">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.status === 'archived' ? 'bg-neutral-100 text-neutral-400' : 'bg-brand-50 text-brand-600')} data-cy="index-span-18">
                <Megaphone size={14} data-cy="index-megaphone-19" />
              </span>
              <div data-cy="index-div-20">
                <div className="flex flex-wrap items-center gap-2" data-cy="index-div-21">
                  <span className={cn('text-sm font-medium', a.status === 'archived' ? 'text-neutral-400' : 'text-ink')} data-cy="index-span-22">{a.title}</span>
                  <StatusBadge status={a.status} data-cy="index-status-badge-23" />
                </div>
                <p className={cn('mt-0.5 max-w-xl text-xs', a.status === 'archived' ? 'text-neutral-400' : 'text-neutral-500')} data-cy="index-p-24">{a.body}</p>
                <p className="mt-1 text-xs text-neutral-400" data-cy="index-p-posted-by">
                  Posted by {a.postedBy} · {new Date(a.postedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
                  {' · '}{audienceDetail(a)} · {a.recipientCount} recipient{a.recipientCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <RowMenu actions={[a.status === 'archived' ? {
          label: 'Restore',
          icon: ArchiveRestore,
          onClick: () => setPending({
            type: 'restore',
            announcement: a
          })
        } : {
          label: 'Archive',
          icon: Archive,
          onClick: () => setPending({
            type: 'archive',
            announcement: a
          })
        }, {
          label: 'Delete',
          icon: Trash2,
          danger: true,
          onClick: () => setPending({
            type: 'delete',
            announcement: a
          })
        }]} data-cy="index-row-menu-26" />
          </div>)}
        {filtered.length === 0 && <div className="px-4 py-10 text-center text-sm text-neutral-400" data-cy="index-div-no-announcements-match-this-filter">
            <Megaphone size={20} className="mx-auto mb-2 text-neutral-300" data-cy="index-megaphone-28" />
            No announcements match this filter.
          </div>}
      </div>

      <AddAnnouncementModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handlePost} batchOptions={batchNumbers} traineeOptions={traineeNames} trainees={trainees} resolveRecipientCount={resolveRecipientCount} data-cy="index-add-announcement-modal-set-modal-open" />

      {pending && <ConfirmDialog open={!!pending} onClose={() => setPending(null)} onConfirm={runConfirmed} title={pending.type === 'archive' ? 'Archive announcement' : pending.type === 'restore' ? 'Restore announcement' : 'Delete announcement'} tone={pending.type === 'delete' ? 'danger' : 'default'} confirmLabel={pending.type === 'archive' ? 'Archive' : pending.type === 'restore' ? 'Restore' : 'Delete permanently'} description={pending.type === 'archive' ? `"${pending.announcement.title}" will be moved to archived records. You can restore it later. It will no longer count toward active announcements.` : pending.type === 'restore' ? `"${pending.announcement.title}" will be restored to active records.` : `This permanently deletes "${pending.announcement.title}" and cannot be undone. Consider archiving instead if you may need it for reference.`} data-cy="index-confirm-dialog-set-pending" />}
    </div>;
}