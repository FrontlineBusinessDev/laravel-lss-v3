import { useState } from 'react'
import { Mail, Bell, Pencil, Send } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { EditEmailTemplateModal } from './EditEmailTemplateModal'
import type { SeminarEmailTemplate, SeminarAdminAlertSetting } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  templates: SeminarEmailTemplate[]
  onUpdateTemplate: (id: string, patch: Partial<SeminarEmailTemplate>) => void
  adminAlerts: SeminarAdminAlertSetting[]
  onToggleAlert: (key: SeminarAdminAlertSetting['key']) => void
}

export function EmailNotificationsTab({ templates, onUpdateTemplate, adminAlerts, onToggleAlert }: Props) {
  const { showToast } = useToast()
  const [editing, setEditing] = useState<SeminarEmailTemplate | null>(null)

  function toggleTemplate(t: SeminarEmailTemplate) {
    onUpdateTemplate(t.id, { enabled: !t.enabled })
    showToast(`"${t.name}" ${t.enabled ? 'disabled' : 'enabled'}.`, 'success')
  }

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Mail size={14} className="text-brand-500" /> Participant email templates
        </h2>
        <p className="mb-3 text-xs text-neutral-500">
          These are sent automatically at each stage of a participant's journey — from registration through certificate release.
        </p>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {templates.map((t, i) => (
            <div
              key={t.id}
              className={cn('flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between', i !== 0 && 'border-t border-neutral-100')}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                <p className="truncate text-xs text-neutral-500">{t.trigger}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => setEditing(t)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600"
                >
                  <Pencil size={12} /> Edit
                </button>
                <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" checked={t.enabled} onChange={() => toggleTemplate(t)} />
                  <span className="absolute inset-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-brand-500" />
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Bell size={14} className="text-brand-500" /> Admin notifications
        </h2>
        <p className="mb-3 text-xs text-neutral-500">Control which seminar events alert admins via the notification bell.</p>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {adminAlerts.map((a, i) => (
            <div key={a.key} className={cn('flex items-center justify-between gap-3 px-4 py-3', i !== 0 && 'border-t border-neutral-100')}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{a.label}</p>
                <p className="truncate text-xs text-neutral-500">{a.description}</p>
              </div>
              <label className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={a.enabled} onChange={() => onToggleAlert(a.key)} />
                <span className="absolute inset-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-brand-500" />
                <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </section>

      <EditEmailTemplateModal open={!!editing} onClose={() => setEditing(null)} template={editing} onSave={onUpdateTemplate} />
    </div>
  )
}
