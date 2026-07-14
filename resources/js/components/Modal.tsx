import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: number;
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 440
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 animate-fadeIn" onMouseDown={e => e.target === e.currentTarget && onClose()} data-cy="modal-div-1">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full rounded-lg bg-white p-6 shadow-modal animate-scaleIn max-h-[90vh] overflow-y-auto lss-scrollbar" style={{
      maxWidth
    }} data-cy="modal-div-2">
        <div className="mb-1 flex items-start justify-between gap-4" data-cy="modal-div-3">
          <h2 id="modal-title" className="text-lg font-semibold text-ink" data-cy="modal-h2-modal-title">
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close dialog" className="rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="modal-button-close-dialog">
            <X size={18} data-cy="modal-x-6" />
          </button>
        </div>
        {description && <p className="mb-4 text-xs text-neutral-500" data-cy="modal-p-7">{description}</p>}
        {!description && <div className="mb-4" data-cy="modal-div-8" />}
        {children}
      </div>
    </div>, document.body);
}