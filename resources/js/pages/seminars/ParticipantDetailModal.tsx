import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Mail, Send, User, Wallet } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { SelectField, TextField, TextAreaField } from '@/components/FormField'
import { useToast } from '@/components/Toast'
import { useNotifications } from '@/context/NotificationsContext'
import { TODAY } from '@/data/mockData'
import type { SeminarParticipant, SeminarProgress } from '@/types'
import { PARTICIPANT_STATUS_STYLE, progressPercent } from './seminarUtils'
import { cn } from '@/lib/utils'

const PROGRESS_STEPS: { key: keyof SeminarProgress; label: string }[] = [
  { key: 'registration', label: 'Registration' },
  { key: 'payment', label: 'Payment' },
  { key: 'seminarProper', label: 'Seminar proper' },
  { key: 'feedbackForm', label: 'Feedback form' },
  { key: 'certificate', label: 'Certificate' },
]

interface Props {
  open: boolean
  onClose: () => void
  participant: SeminarParticipant | null
  onUpdate: (id: string, patch: Partial<SeminarParticipant>) => void
}

export function ParticipantDetailModal({ open, onClose, participant, onUpdate }: Props) {
  const { showToast } = useToast()
  const { notify } = useNotifications()
  const [payment, setPayment] = useState({ status: 'Pending', date: '', amount: '', referenceNo: '', remarks: '' })

  useEffect(() => {
    if (participant) {
      setPayment({
        status: participant.payment?.status ?? 'Pending',
        date: participant.payment?.date ?? '',
        amount: participant.payment?.amount != null ? String(participant.payment.amount) : '',
        referenceNo: participant.payment?.referenceNo ?? '',
        remarks: participant.payment?.remarks ?? '',
      })
    }
  }, [participant])

  if (!participant) return null
  const pct = progressPercent(participant)

  function toggleStep(key: keyof SeminarProgress) {
    const base: SeminarProgress = participant!.progress ?? {
      registration: false, payment: false, seminarProper: false, feedbackForm: false, certificate: false,
    }
    onUpdate(participant!.id, { progress: { ...base, [key]: !base[key] } })
  }

  function savePayment() {
    onUpdate(participant!.id, {
      payment: {
        status: payment.status as any,
        date: payment.date || undefined,
        amount: payment.amount ? Number(payment.amount) : undefined,
        referenceNo: payment.referenceNo || undefined,
        remarks: payment.remarks || undefined,
      },
    })
    showToast('Payment information updated.', 'success')
  }

  function resend(kind: string) {
    showToast(`${kind} email sent to ${participant!.email}.`, 'success')
    notify({
      audience: 'trainee',
      title: `${kind} email`,
      body: `${kind} email sent to ${participant!.name} (${participant!.seminarTopic}).`,
      createdAt: TODAY.toISOString(),
      link: '/seminars',
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Participant details" maxWidth={560}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
            {participant.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">{participant.name}</h3>
            <p className="text-xs text-neutral-500">{participant.seminarTopic}</p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium', PARTICIPANT_STATUS_STYLE[participant.status])}>
          {participant.status}
        </span>
      </div>

      {/* Personal information */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <User size={13} className="text-brand-500" /> Personal information
        </h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-[11px] text-neutral-400">Email</dt>
            <dd className="truncate text-neutral-700">{participant.email}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-neutral-400">Mobile</dt>
            <dd className="text-neutral-700">{participant.mobile || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-neutral-400">Location</dt>
            <dd className="text-neutral-700">{participant.location || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-neutral-400">Profession</dt>
            <dd className="text-neutral-700">{participant.profession || '—'}</dd>
          </div>
          {participant.isStudent && (
            <div>
              <dt className="text-[11px] text-neutral-400">Student ID</dt>
              <dd className="text-neutral-700">{participant.studentId || '—'}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Registration progress checklist */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-neutral-600">Registration progress</h4>
          <span className="text-[11px] font-medium text-neutral-500">{pct}% complete</span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROGRESS_STEPS.map((step) => {
            const done = !!participant.progress?.[step.key]
            return (
              <button
                key={step.key}
                onClick={() => toggleStep(step.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors',
                  done ? 'border-success-100 bg-success-50 text-success-800' : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50',
                )}
              >
                {done ? <CheckCircle2 size={13} className="shrink-0" /> : <Circle size={13} className="shrink-0" />}
                <span className="truncate">{step.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Payment information */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <Wallet size={13} className="text-brand-500" /> Payment information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Payment status"
            options={['Pending', 'Paid', 'Refunded', 'Waived']}
            value={payment.status}
            onChange={(e) => setPayment((p) => ({ ...p, status: e.target.value }))}
          />
          <TextField label="Payment date" type="date" value={payment.date} onChange={(e) => setPayment((p) => ({ ...p, date: e.target.value }))} />
          <TextField
            label="Amount paid"
            type="number"
            placeholder="0"
            value={payment.amount}
            onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
          />
          <TextField
            label="Reference number"
            placeholder="e.g. GC-88213041"
            value={payment.referenceNo}
            onChange={(e) => setPayment((p) => ({ ...p, referenceNo: e.target.value }))}
          />
        </div>
        <TextAreaField
          label="Remarks"
          optional
          placeholder="Notes about this payment"
          value={payment.remarks}
          onChange={(e) => setPayment((p) => ({ ...p, remarks: e.target.value }))}
        />
        <div className="-mt-2 flex justify-end">
          <Button variant="secondary" size="sm" onClick={savePayment}>
            Save payment info
          </Button>
        </div>
      </section>

      {/* Resend communications */}
      <section className="mb-1">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <Mail size={13} className="text-brand-500" /> Resend email
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Payment instructions')}>
            Payment instructions
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Seminar reminder')}>
            Seminar reminder
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Certificate')}>
            Certificate
          </Button>
        </div>
      </section>

      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
