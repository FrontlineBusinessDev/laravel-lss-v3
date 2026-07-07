/**
 * @file hooks/use-modal-behavior.ts
 * Shared open/close behaviour for the ModalCenter / ModalSide primitives:
 * Escape-to-close and overlay-click-to-close, plus the overlay ref used to
 * distinguish a scrim click from a click inside the panel.
 */

import { useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface UseModalBehaviorOptions {
    show: boolean;
    onClose: () => void;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
}

export function useModalBehavior({
    show,
    onClose,
    closeOnEscape = true,
    closeOnOverlayClick = true,
}: UseModalBehaviorOptions) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!show || !closeOnEscape) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => document.removeEventListener('keydown', onKey);
    }, [show, closeOnEscape, onClose]);

    const handleOverlayClick = (e: ReactMouseEvent) => {
        if (closeOnOverlayClick && e.target === overlayRef.current) {
            onClose();
        }
    };

    return { overlayRef, handleOverlayClick };
}
