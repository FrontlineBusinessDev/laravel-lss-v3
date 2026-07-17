import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Mail, Send, User, Wallet } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { SelectField, TextField, TextAreaField } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import { useNotifications } from '@/context/NotificationsContext';
import { TODAY } from '@/data/mockData';
import type { SeminarParticipant, SeminarProgress } from '@/types';
import { PARTICIPANT_STATUS_STYLE, progressPercent } from './seminarUtils';
import { cn } from '@/lib/utils';
const PROGRESS_STEPS: {
  key: keyof SeminarProgress;
  label: string;
}[] = [{
  key: 'registration',
  label: 'Registration'
}, {
  key: 'payment',
  label: 'Payment'
}, {
  key: 'seminarProper',
  label: 'Seminar proper'
}, {
  key: 'feedbackForm',
  label: 'Feedback form'
}, {
  key: 'certificate',
  label: 'Certificate'
}];
interface Props {
  open: boolean;
  onClose: () => void;
  participant: SeminarParticipant | null;
  onUpdate: (id: string, patch: Partial<SeminarParticipant>) => void;
}
export function ParticipantDetailModal({
  open,
  onClose,
  participant,
  onUpdate
}: Props) {
  const {
    showToast
  } = useToast();
  const {
    notify
  } = useNotifications();
  const [payment, setPayment] = useState({
    status: 'Pending',
    date: '',
    amount: '',
    referenceNo: '',
    remarks: ''
  });
  useEffect(() => {
    if (participant) {
      setPayment({
        status: participant.payment?.status ?? 'Pending',
        date: participant.payment?.date ?? '',
        amount: participant.payment?.amount != null ? String(participant.payment.amount) : '',
        referenceNo: participant.payment?.referenceNo ?? '',
        remarks: participant.payment?.remarks ?? ''
      });
    }
  }, [participant]);
  if (!participant) return null;
  const pct = progressPercent(participant);
  function toggleStep(key: keyof SeminarProgress) {
    const base: SeminarProgress = participant!.progress ?? {
      registration: false,
      payment: false,
      seminarProper: false,
      feedbackForm: false,
      certificate: false
    };
    onUpdate(participant!.id, {
      progress: {
        ...base,
        [key]: !base[key]
      }
    });
  }
  function savePayment() {
    onUpdate(participant!.id, {
      payment: {
        status: payment.status as any,
        date: payment.date || undefined,
        amount: payment.amount ? Number(payment.amount) : undefined,
        referenceNo: payment.referenceNo || undefined,
        remarks: payment.remarks || undefined
      }
    });
    showToast('Payment information updated.', 'success');
  }
  function resend(kind: string) {
    showToast(`${kind} email sent to ${participant!.email}.`, 'success');
    notify({
      audience: 'trainee',
      title: `${kind} email`,
      body: `${kind} email sent to ${participant!.name} (${participant!.seminarTopic}).`,
      createdAt: TODAY.toISOString(),
      link: '/seminars'
    });
  }
  return <Modal open={open} onClose={onClose} title="Participant details" maxWidth={560} data-cy="participant-detail-modal-modal-participant-details">
      <div className="mb-4 flex items-start justify-between gap-3" data-cy="participant-detail-modal-div-2">
        <div className="flex items-center gap-3" data-cy="participant-detail-modal-div-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600" data-cy="participant-detail-modal-div-4">
            {participant.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div data-cy="participant-detail-modal-div-5">
            <h3 className="text-sm font-semibold text-ink" data-cy="participant-detail-modal-h3-6">{participant.name}</h3>
            <p className="text-xs text-neutral-500" data-cy="participant-detail-modal-p-7">{participant.seminarTopic}</p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium', PARTICIPANT_STATUS_STYLE[participant.status])} data-cy="participant-detail-modal-span-8">
          {participant.status}
        </span>
      </div>

      {/* Personal information */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3" data-cy="participant-detail-modal-section-9">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600" data-cy="participant-detail-modal-h4-personal-information">
          <User size={13} className="text-brand-500" data-cy="participant-detail-modal-user-11" /> Personal information
        </h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm" data-cy="participant-detail-modal-dl-12">
          <div data-cy="participant-detail-modal-div-13">
            <dt className="text-[11px] text-neutral-400" data-cy="participant-detail-modal-dt-email">Email</dt>
            <dd className="truncate text-neutral-700" data-cy="participant-detail-modal-dd-15">{participant.email}</dd>
          </div>
          <div data-cy="participant-detail-modal-div-16">
            <dt className="text-[11px] text-neutral-400" data-cy="participant-detail-modal-dt-mobile">Mobile</dt>
            <dd className="text-neutral-700" data-cy="participant-detail-modal-dd-18">{participant.mobile || '—'}</dd>
          </div>
          <div data-cy="participant-detail-modal-div-19">
            <dt className="text-[11px] text-neutral-400" data-cy="participant-detail-modal-dt-location">Location</dt>
            <dd className="text-neutral-700" data-cy="participant-detail-modal-dd-21">{participant.location || '—'}</dd>
          </div>
          <div data-cy="participant-detail-modal-div-22">
            <dt className="text-[11px] text-neutral-400" data-cy="participant-detail-modal-dt-profession">Profession</dt>
            <dd className="text-neutral-700" data-cy="participant-detail-modal-dd-24">{participant.profession || '—'}</dd>
          </div>
          {participant.isStudent && <div data-cy="participant-detail-modal-div-25">
              <dt className="text-[11px] text-neutral-400" data-cy="participant-detail-modal-dt-student-id">Student ID</dt>
              <dd className="text-neutral-700" data-cy="participant-detail-modal-dd-27">{participant.studentId || '—'}</dd>
            </div>}
        </dl>
      </section>

      {/* Registration progress checklist */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3" data-cy="participant-detail-modal-section-28">
        <div className="mb-2 flex items-center justify-between" data-cy="participant-detail-modal-div-29">
          <h4 className="text-xs font-semibold text-neutral-600" data-cy="participant-detail-modal-h4-registration-progress">Registration progress</h4>
          <span className="text-[11px] font-medium text-neutral-500" data-cy="participant-detail-modal-span-complete">{pct}% complete</span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100" data-cy="participant-detail-modal-div-32">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{
          width: `${pct}%`
        }} data-cy="participant-detail-modal-div-33" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-cy="participant-detail-modal-div-34">
          {PROGRESS_STEPS.map(step => {
          const done = !!participant.progress?.[step.key];
          return <button key={step.key} onClick={() => toggleStep(step.key)} className={cn('flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors', done ? 'border-success-100 bg-success-50 text-success-800' : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50')} data-cy="participant-detail-modal-button-toggle-step">
                {done ? <CheckCircle2 size={13} className="shrink-0" data-cy="participant-detail-modal-check-circle2-36" /> : <Circle size={13} className="shrink-0" data-cy="participant-detail-modal-circle-37" />}
                <span className="truncate" data-cy="participant-detail-modal-span-38">{step.label}</span>
              </button>;
        })}
        </div>
      </section>

      {/* Payment information */}
      <section className="mb-4 rounded-lg border border-neutral-200 p-3" data-cy="participant-detail-modal-section-39">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600" data-cy="participant-detail-modal-h4-payment-information">
          <Wallet size={13} className="text-brand-500" data-cy="participant-detail-modal-wallet-41" /> Payment information
        </h4>
        <div className="grid grid-cols-2 gap-3" data-cy="participant-detail-modal-div-42">
          <SelectField label="Payment status" options={['Pending', 'Paid', 'Refunded', 'Waived']} value={payment.status} onChange={e => setPayment(p => ({
          ...p,
          status: e.target.value
        }))} data-cy="participant-detail-modal-select-field-payment-status" />
          <TextField label="Payment date" type="date" value={payment.date} onChange={e => setPayment(p => ({
          ...p,
          date: e.target.value
        }))} data-cy="participant-detail-modal-text-field-payment-date" />
          <TextField label="Amount paid" type="number" placeholder="0" value={payment.amount} onChange={e => setPayment(p => ({
          ...p,
          amount: e.target.value
        }))} data-cy="participant-detail-modal-text-field-amount-paid" />
          <TextField label="Reference number" placeholder="e.g. GC-88213041" value={payment.referenceNo} onChange={e => setPayment(p => ({
          ...p,
          referenceNo: e.target.value
        }))} data-cy="participant-detail-modal-text-field-reference-number" />
        </div>
        <TextAreaField label="Remarks" optional placeholder="Notes about this payment" value={payment.remarks} onChange={e => setPayment(p => ({
        ...p,
        remarks: e.target.value
      }))} data-cy="participant-detail-modal-text-area-field-remarks" />
        <div className="-mt-2 flex justify-end" data-cy="participant-detail-modal-div-48">
          <Button variant="secondary" size="sm" onClick={savePayment} data-cy="participant-detail-modal-button-save-payment">
            Save payment info
          </Button>
        </div>
      </section>

      {/* Resend communications */}
      <section className="mb-1" data-cy="participant-detail-modal-section-50">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600" data-cy="participant-detail-modal-h4-resend-email">
          <Mail size={13} className="text-brand-500" data-cy="participant-detail-modal-mail-52" /> Resend email
        </h4>
        <div className="flex flex-wrap gap-2" data-cy="participant-detail-modal-div-53">
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Payment instructions')} data-cy="participant-detail-modal-button-resend">
            Payment instructions
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Seminar reminder')} data-cy="participant-detail-modal-button-resend-2">
            Seminar reminder
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={() => resend('Certificate')} data-cy="participant-detail-modal-button-resend-3">
            Certificate
          </Button>
        </div>
      </section>

      <div className="mt-5 flex justify-end" data-cy="participant-detail-modal-div-57">
        <Button variant="secondary" onClick={onClose} data-cy="participant-detail-modal-button-close">
          Close
        </Button>
      </div>
    </Modal>;
}