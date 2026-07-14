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

    //  <div className="fixed top-0 right-0 bottom-0 left-0 z-30 h-full w-full">
    //                 <div
    //                     className="relative z-50 h-full w-full bg-black/40"
    //                     onClick={handleClose}
    //                 />

    //                 <div className="absolute top-1/2 left-1/2 z-60 max-h-[calc(100dvh-100px)] -translate-1/2 transform rounded-md bg-white shadow-md"></div>
    return (
        <div
            ref={overlayRef}
            className="fixed top-0 right-0 bottom-0 left-0 z-30 h-full w-full"
            onClick={handleOverlayClick}
            role="presentation"
            data-cy="modal-side-div-overlay-click"
        >
            <div
                className="absolute top-1/2 left-1/2 z-60 max-h-[calc(100dvh-100px)] -translate-1/2 transform rounded-md bg-white shadow-md"
                style={{
                    width,
                    maxWidth: '94vw',
                }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                data-cy="modal-side-div-title"
            >
                {(title || subtitle) && (
                    <header
                        className="flex shrink-0 items-start justify-between gap-3.5 border-b border-[#f1f2f5] px-6 pt-5.5 pb-4"
                        data-cy="modal-side-header-3"
                    >
                        <div className="min-w-0" data-cy="modal-side-div-4">
                            {title && (
                                <h2
                                    className="text-[17px] font-extrabold tracking-[-0.01em] text-[#14151a]"
                                    data-cy="modal-side-h2-5"
                                >
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p
                                    className="mt-0.5 text-[12.5px] text-gray-500"
                                    data-cy="modal-side-p-6"
                                >
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="fl-iconbtn"
                            onClick={onClose}
                            aria-label="Close"
                            data-cy="modal-side-button-close"
                        >
                            <X size={16} data-cy="modal-side-x-8" />
                        </button>
                    </header>
                )}
                {/* Body fills the panel; each ModalComponent owns its own scroll
                    region + sticky footer via `flex h-full flex-col`. */}
                <div
                    className="flex min-h-0 flex-1 flex-col"
                    data-cy="modal-side-div-9"
                >
                    <ModalComponent
                        data={data}
                        close={onClose}
                        data-cy="modal-side-modal-component-10"
                    />
                </div>
            </div>
        </div>
    );
}
