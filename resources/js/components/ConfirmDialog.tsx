import { ReactNode } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  confirmDisabled?: boolean
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  confirmDisabled,
  children,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
      <div className="mb-4 flex gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600',
          )}
        >
          <AlertTriangle size={17} />
        </div>
        <div className="pt-1 text-sm leading-relaxed text-neutral-600">{description}</div>
      </div>
      {children}
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          className={cn('flex-1', tone === 'danger' && '!bg-danger-600 !border-danger-600 hover:!bg-danger-700')}
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
