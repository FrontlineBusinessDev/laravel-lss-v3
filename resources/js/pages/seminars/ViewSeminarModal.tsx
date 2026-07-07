import { Copy, Users, MapPin, CalendarDays, Wallet, ArrowRight } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { useToast } from '@/components/Toast'
import { SEMINAR_STATUS_STYLE, SEMINAR_STATUS_LABEL, PARTICIPANT_STATUS_STYLE, formatDate } from './seminarUtils'
import type { Seminar, SeminarParticipant } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  seminar: Seminar | null
  participants: SeminarParticipant[]
  onViewParticipants: (topic: string) => void
}

export function ViewSeminarModal({ open, onClose, seminar, participants, onViewParticipants }: Props) {
  const { showToast } = useToast()
  if (!seminar) return null

  const list = participants.filter((p) => p.seminarTopic === seminar.topic)

  function copyLink() {
    navigator.clipboard?.writeText(seminar!.registrationLink).catch(() => {})
    showToast('Registration link copied to clipboard.', 'success')
  }

  return (
    <Modal open={open} onClose={onClose} title="Seminar details" maxWidth={560}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{seminar.topic}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">{seminar.type}</p>
        </div>
        <span className={cn('shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium capitalize', SEMINAR_STATUS_STYLE[seminar.status])}>
          {SEMINAR_STATUS_LABEL[seminar.status]}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-neutral-600">{seminar.description}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
        <div className="flex items-center gap-2 text-neutral-700">
          <CalendarDays size={14} className="text-neutral-400" /> {formatDate(seminar.date)}
        </div>
        <div className="flex items-center gap-2 text-neutral-700">
          <MapPin size={14} className="text-neutral-400" /> {seminar.venue}
        </div>
        <div className="flex items-center gap-2 text-neutral-700">
          <Wallet size={14} className="text-neutral-400" /> {seminar.fee > 0 ? `PHP ${seminar.fee.toLocaleString()}` : 'Free'}
        </div>
        <div className="flex items-center gap-2 text-neutral-700">
          <Users size={14} className="text-neutral-400" />
          {seminar.registeredCount}
          {seminar.maxParticipants ? ` / ${seminar.maxParticipants}` : ''} registered
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Registration link</label>
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-2">
          <span className="flex-1 truncate font-mono text-xs text-neutral-500">{seminar.registrationLink}</span>
          <button onClick={copyLink} className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600">
            <Copy size={12} /> Copy
          </button>
        </div>
        {seminar.status !== 'active' && (
          <p className="mt-1 text-[11px] text-neutral-400">This link is inactive since the seminar is no longer Active.</p>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-neutral-600">Registered participants ({list.length})</h4>
        {list.length > 0 && (
          <button
            onClick={() => onViewParticipants(seminar.topic)}
            className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600"
          >
            View all <ArrowRight size={12} />
          </button>
        )}
      </div>
      <div className="max-h-52 overflow-y-auto rounded-md border border-neutral-200 lss-scrollbar">
        {list.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-400">No one has registered yet.</div>
        ) : (
          list.slice(0, 6).map((p, i) => (
            <div key={p.id} className={cn('flex items-center justify-between gap-3 px-3 py-2', i !== 0 && 'border-t border-neutral-100')}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                <p className="truncate text-[11px] text-neutral-500">{p.email}</p>
              </div>
              <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', PARTICIPANT_STATUS_STYLE[p.status])}>
                {p.status}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
