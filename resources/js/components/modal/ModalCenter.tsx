// resources/js/components/ui/center-modal.tsx
import { useModalBehavior } from '@/hooks/use-modal-behavior';
type Size = 'sm' | 'md' | 'lg' | 'xl';
const WIDTHS: Record<Size, number> = {
  sm: 400,
  md: 540,
  lg: 720,
  xl: 960
};
export type ModalComponentProps<T> = {
  data: T | null;
  close: () => void;
};
type ModalCenterProps<T> = {
  show: boolean;
  onClose: () => void;
  data?: T | null;
  size?: Size;
  title?: string;
  /** Renders the modal body — receives `data` and `close` so it doesn't need its own props wiring. */
  ModalComponent: React.ComponentType<ModalComponentProps<T>>;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
};
export function ModalCenter<T>({
  show,
  onClose,
  data = null,
  size = 'md',
  title,
  ModalComponent,
  closeOnEscape = true,
  closeOnOverlayClick = true
}: ModalCenterProps<T>) {
  const {
    overlayRef,
    handleOverlayClick
  } = useModalBehavior({
    show,
    onClose,
    closeOnEscape,
    closeOnOverlayClick
  });
  if (!show) return null;
  return <div ref={overlayRef} className="fl-scrim fl-scrim--center" onClick={handleOverlayClick} role="presentation" data-cy="modal-center-div-overlay-click">
            <div className="fl-center-panel" style={{
      width: WIDTHS[size],
      maxWidth: '92vw'
    }} role="dialog" aria-modal="true" aria-label={title} data-cy="modal-center-div-title">
                {title && <header className="fl-center-head" data-cy="modal-center-header-3">
                        <h2 className="fl-center-title" data-cy="modal-center-h2-4">{title}</h2>
                        <button type="button" className="fl-iconbtn" onClick={onClose} aria-label="Close" data-cy="modal-center-button-close">
                            ✕
                        </button>
                    </header>}
                <div className="fl-center-body" data-cy="modal-center-div-6">
                    <ModalComponent data={data} close={onClose} data-cy="modal-center-modal-component-7" />
                </div>
            </div>
        </div>;
}