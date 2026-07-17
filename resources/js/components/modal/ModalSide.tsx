/**
 * @file components/modal/ModalSide.tsx
 * Drawer shell: an edge-anchored, full-height panel. Shares its contract and
 * open/close behaviour with ModalCenter (same `show`/`onClose`/`data`/
 * `ModalComponent` props, same useModalBehavior for Escape + scrim click, same
 * unmount-on-close), so <FormModal> can swap between the two purely on `layout`.
 */

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

/** Edge anchoring + matching slide-in, keyed off the `side` prop. */
const SIDE_CLASSES: Record<Side, string> = {
    right: 'right-0 animate-slideInRight',
    left: 'left-0 animate-slideInLeft',
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
            className="fixed top-0 right-0 bottom-0 left-0 z-30 h-full w-full"
            onClick={handleOverlayClick}
            role="presentation"
            data-cy="modal-side-div-overlay-click"
        >
            <div
                className="absolute inset-0 z-50 animate-fadeIn bg-black/40"
                onClick={onClose}
                data-cy="modal-side-div-scrim"
            />
            <div
                className={`absolute inset-y-0 z-60 flex h-full flex-col bg-white shadow-md ${SIDE_CLASSES[side]}`}
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
                {/* Scrolls the body while the ModalComponent's own `mt-auto`
                    footer stays pinned to the bottom of the panel. */}
                <div
                    className="flex min-h-0 flex-1 flex-col overflow-auto"
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
