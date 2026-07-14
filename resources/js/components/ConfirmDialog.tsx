import { ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  confirmDisabled?: boolean;
  children?: ReactNode;
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
  children
}: ConfirmDialogProps) {
  if (!open) return null;
  return <Modal open={open} onClose={onClose} title={title} maxWidth={400} data-cy="confirm-dialog-modal-title">
      <div className="mb-4 flex gap-3" data-cy="confirm-dialog-div-2">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-600')} data-cy="confirm-dialog-div-3">
          <AlertTriangle size={17} data-cy="confirm-dialog-alert-triangle-4" />
        </div>
        <div className="pt-1 text-sm leading-relaxed text-neutral-600" data-cy="confirm-dialog-div-5">{description}</div>
      </div>
      {children}
      <div className="mt-5 flex gap-2" data-cy="confirm-dialog-div-6">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="confirm-dialog-button-close">
          {cancelLabel}
        </Button>
        <Button variant="primary" className={cn('flex-1', tone === 'danger' && '!bg-danger-600 !border-danger-600 hover:!bg-danger-700')} onClick={onConfirm} disabled={confirmDisabled} data-cy="confirm-dialog-button-confirm">
          {confirmLabel}
        </Button>
      </div>
    </Modal>;
}