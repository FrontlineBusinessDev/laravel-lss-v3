import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
    open: boolean;
    src: string;
    alt?: string;
    onClose: () => void;
}

/**
 * Full-size image viewer. Built on the same portal/Escape/click-out pattern as
 * `Modal.tsx`, but at a higher stacking context (`z-[70]`) so it layers above
 * the record modal (`z-50`) and dropdown menus (`z-60`). Body-scroll locking is
 * intentionally left to the parent modal to avoid clobbering its lock on close.
 */
export function ImageLightbox({
    open,
    src,
    alt = '',
    onClose,
}: ImageLightboxProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        // Capture-phase + stopImmediatePropagation so Escape closes ONLY the
        // lightbox and not the record modal underneath it (which also listens
        // for Escape on `document`).
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') {
                return;
            }

            e.stopImmediatePropagation();
            onClose();
        };
        document.addEventListener('keydown', onKey, true);

        return () => document.removeEventListener('keydown', onKey, true);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[70] flex animate-fadeIn items-center justify-center bg-ink/70 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Close image"
                className="absolute top-4 right-4 rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
                <X size={20} />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-[90vw] animate-scaleIn rounded-lg object-contain shadow-modal"
            />
        </div>,
        document.body,
    );
}
