import { ReactNode } from 'react'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { getLeaveDayCount } from '@/data/mockData'
import type { LeaveRecord } from '@/types'
import { cn } from '@/lib/utils'

export const LEAVE_STATUS_STYLE: Record<LeaveRecord['status'], string> = {
  pending: 'bg-warning-50 text-warning-800',
  approved: 'bg-success-50 text-success-800',
  declined: 'bg-danger-50 text-danger-800',
}
export const LEAVE_STATUS_LABEL: Record<LeaveRecord['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-neutral-500">{label}</div>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  )
}

interface LeaveDetailsModalProps {
  record: LeaveRecord | null
  onClose: () => void
  onRequestApprove: (record: LeaveRecord) => void
  onRequestDecline: (record: LeaveRecord) => void
}

export function LeaveDetailsModal({ record, onClose, onRequestApprove, onRequestDecline }: LeaveDetailsModalProps) {
  return (
    <Modal open={!!record} onClose={onClose} title="Leave request details" maxWidth={520}>
      {record && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', LEAVE_STATUS_STYLE[record.status])}>
              {LEAVE_STATUS_LABEL[record.status]}
            </span>
            <span className="text-xs text-neutral-400">Submitted {record.dateSubmitted}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md bg-neutral-50 p-3.5">
            <Field label="Trainee name">{record.traineeName}</Field>
            <Field label="Batch">{record.batchNo}</Field>
            <Field label="School">{record.school}</Field>
            <Field label="Leave type">{record.leaveType}</Field>
            <Field label="Leave date">{record.leaveDate}</Field>
            <Field label="Return date">{record.returnDate}</Field>
            <Field label="Number of leave days">{getLeaveDayCount(record)} day{getLeaveDayCount(record) === 1 ? '' : 's'}</Field>
          </div>

          <div>
            <div className="text-[11px] font-medium text-neutral-500">Reason / remarks</div>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{record.remarks}</p>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium text-neutral-500">Supporting documents</div>
            {record.supportingDocuments && record.supportingDocuments.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {record.supportingDocuments.map((doc) => (
                  <a
                    key={doc.link}
                    href={doc.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
                  >
                    <FileText size={13} className="shrink-0" />
                    {doc.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No supporting documents attached.</p>
            )}
          </div>

          {record.status !== 'pending' && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-neutral-200 p-3.5">
              <Field label={record.status === 'approved' ? 'Approved by' : 'Declined by'}>{record.decidedBy ?? '\u2014'}</Field>
              <Field label={record.status === 'approved' ? 'Approval date' : 'Decline date'}>{record.decisionDate ?? '\u2014'}</Field>
              <div className="col-span-2">
                <div className="text-[11px] font-medium text-neutral-500">
                  {record.status === 'approved' ? 'Approval remarks (optional)' : 'Decline remarks'}
                </div>
                <p className="mt-0.5 text-sm text-neutral-700">{record.decisionRemarks || '\u2014'}</p>
              </div>
            </div>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {record.status === 'pending' && (
              <>
                <Button variant="danger" icon={XCircle} onClick={() => onRequestDecline(record)}>
                  Decline
                </Button>
                <Button variant="primary" icon={CheckCircle2} onClick={() => onRequestApprove(record)}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
