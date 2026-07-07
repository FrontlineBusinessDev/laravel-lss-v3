// resources/js/components/ui/side-modal.tsx
import { X } from 'lucide-react';
import { useModalBehavior } from '@/hooks/use-modal-behavior';
import type { ModalComponentProps } from './ModalCenter';

type Side = 'left' | 'right';

type ModalSideProps<T> = {
    show: boolean;
    onClose: () => void;
    data?: T | null;
    side?: Side;
    width?: number;
    title?: string;
    subtitle?: string;
    ModalComponent: React.ComponentType<ModalComponentProps<T>>;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
};

export function ModalSide<T>({
    show,
    onClose,
    data = null,
    side = 'right',
    width = 540,
    title,
    subtitle,
    ModalComponent,
    closeOnEscape = true,
    closeOnOverlayClick = true,
}: ModalSideProps<T>) {
    const { overlayRef, handleOverlayClick } = useModalBehavior({
        show,
        onClose,
        closeOnEscape,
        closeOnOverlayClick,
    });

    if (!show) {
        return null;
    }

    return (
        <div
            ref={overlayRef}
            className="fl-scrim"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                className={`fl-panel fl-panel--${side}`}
                style={{ width, maxWidth: '94vw' }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {(title || subtitle) && (
                    <header className="flex shrink-0 items-start justify-between gap-3.5 border-b border-[#f1f2f5] px-6 pt-[22px] pb-4">
                        <div className="min-w-0">
                            {title && (
                                <h2 className="text-[17px] font-extrabold tracking-[-0.01em] text-[#14151a]">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="mt-0.5 text-[12.5px] text-gray-500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="fl-iconbtn"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </header>
                )}
                {/* Body fills the panel; each ModalComponent owns its own scroll
                    region + sticky footer via `flex h-full flex-col`. */}
                <div className="flex min-h-0 flex-1 flex-col">
                    <ModalComponent data={data} close={onClose} />
                </div>
            </div>
        </div>
    );
}
