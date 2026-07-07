import { useMemo, useState } from 'react'
import { Bell, Mail, MessageSquare, Send, History, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { useNotifications } from '@/context/NotificationsContext'
import { useToast } from '@/components/Toast'
import { TODAY, currentUser } from '@/data/mockData'
import type { Trainee } from '@/types'
import { cn } from '@/lib/utils'

type Channel = 'email' | 'chat'

export function NotificationsPanel({ candidates }: { candidates: Trainee[] }) {
  const { notify, traineeNotifications } = useNotifications()
  const { showToast } = useToast()
  const [channels, setChannels] = useState<Record<Channel, boolean>>({ email: true, chat: true })
  const [sentIds, setSentIds] = useState<Set<string>>(new Set())

  const channelLabel = () => {
    const list = [channels.email && 'email', channels.chat && 'Google Chat'].filter(Boolean)
    return list.length ? list.join(' and ') : 'no channel selected'
  }

  function sendOne(trainee: Trainee) {
    if (!channels.email && !channels.chat) {
      showToast('Select at least one notification channel.', 'error')
      return
    }
    notify({
      audience: 'trainee',
      title: 'Evaluation form reminder',
      body: `Hi ${trainee.name}, you've completed your required ${trainee.requiredHrs} training hours. Please accomplish your trainer evaluation form at your earliest convenience.`,
      createdAt: TODAY.toISOString(),
      link: '/evaluation',
    })
    setSentIds((prev) => new Set(prev).add(trainee.id))
    showToast(`Reminder sent to ${trainee.name} via ${channelLabel()}.`, 'success')
  }

  function sendAll() {
    if (!channels.email && !channels.chat) {
      showToast('Select at least one notification channel.', 'error')
      return
    }
    const pending = candidates.filter((c) => !sentIds.has(c.id))
    if (pending.length === 0) {
      showToast('Everyone eligible has already been notified.', 'success')
      return
    }
    for (const t of pending) {
      notify({
        audience: 'trainee',
        title: 'Evaluation form reminder',
        body: `Hi ${t.name}, you've completed your required ${t.requiredHrs} training hours. Please accomplish your trainer evaluation form at your earliest convenience.`,
        createdAt: TODAY.toISOString(),
        link: '/evaluation',
      })
    }
    setSentIds((prev) => new Set([...prev, ...pending.map((t) => t.id)]))
    showToast(`Reminder sent to ${pending.length} trainee${pending.length === 1 ? '' : 's'} via ${channelLabel()}.`, 'success')
  }

  const history = useMemo(
    () =>
      traineeNotifications
        .filter((n) => n.title === 'Evaluation form reminder')
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [traineeNotifications],
  )

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5">
        <Bell size={14} className="text-brand-500" />
        <h2 className="text-sm font-semibold text-ink">Evaluation reminders</h2>
      </div>
      <p className="mb-3 text-xs text-neutral-500">
        Auto-detected: trainees whose rendered hours have met their required hours but haven't submitted their trainer evaluation yet.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md bg-neutral-50 px-3 py-2.5">
        <span className="text-[11px] font-medium text-neutral-500">Send via:</span>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-700">
          <input
            type="checkbox"
            checked={channels.email}
            onChange={(e) => setChannels((c) => ({ ...c, email: e.target.checked }))}
            className="h-3.5 w-3.5 rounded accent-brand-500"
          />
          <Mail size={13} /> Email
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-neutral-700">
          <input
            type="checkbox"
            checked={channels.chat}
            onChange={(e) => setChannels((c) => ({ ...c, chat: e.target.checked }))}
            className="h-3.5 w-3.5 rounded accent-brand-500"
          />
          <MessageSquare size={13} /> Google Chat
        </label>
        <Button variant="primary" size="sm" icon={Send} className="ml-auto" onClick={sendAll} disabled={candidates.length === 0}>
          Notify all eligible ({candidates.filter((c) => !sentIds.has(c.id)).length})
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto rounded-md border border-neutral-200 lss-scrollbar">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400">No trainees currently need an evaluation reminder.</div>
        ) : (
          candidates.map((t, i) => {
            const sent = sentIds.has(t.id)
            return (
              <div
                key={t.id}
                className={cn('flex items-center justify-between gap-3 px-3 py-2', i !== 0 && 'border-t border-neutral-100')}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                  <p className="truncate text-[11px] text-neutral-500">
                    {t.batchNo} &middot; {t.completedHrs}/{t.requiredHrs} hrs rendered
                  </p>
                </div>
                {sent ? (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-success-600">
                    <CheckCircle2 size={13} /> Sent
                  </span>
                ) : (
                  <Button variant="secondary" size="sm" icon={Send} onClick={() => sendOne(t)}>
                    Notify
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
            <History size={12} /> Recently sent
          </h3>
          <ul className="flex flex-col gap-1">
            {history.map((n) => (
              <li key={n.id} className="truncate text-[11px] text-neutral-400">
                {n.body.split(',')[0].replace('Hi ', '')} &middot; {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-[10px] text-neutral-400">Signed in as {currentUser.name}. Reminders are logged to the trainee notification history.</p>
    </div>
  )
}
