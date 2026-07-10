// ---------------------------------------------------------------------------
// AttachmentViewerModal
//
// In-app document viewer. Clicking "View" on a ticket attachment opens this
// overlay instead of navigating away / triggering a download. The file is
// rendered inline by MIME type:
//   – images  (image/*)        → <img>
//   – PDFs    (application/pdf) → <iframe> (inline-disposition presigned URL)
//   – anything else            → a graceful fallback with Download / Open links
//
// It renders through a portal above whatever modal launched it (e.g. the ticket
// details modal), closes on Escape or backdrop click, and prefers the resolved
// `view_url` (presigned for private files, public for SEO), falling back to the
// app download route when a disk can't produce an object URL (local dev).
// ---------------------------------------------------------------------------

import { Download, ExternalLink, X, FileText } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/** The minimal attachment shape this viewer needs — TicketAttachment and PortalAttachment both satisfy it. */
export interface ViewableAttachment {
    id: number;
    original_name: string;
    mime_type: string;
    file_size: number;
    view_url: string;
    download_url: string;
}

interface Props {
    attachment: ViewableAttachment | null;
    onClose: () => void;
}

function humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentViewerModal({ attachment, onClose }: Props) {
    const isImage = attachment?.mime_type.startsWith('image/');
    const isPdf = attachment?.mime_type === 'application/pdf';

    // 1. Manage Global Side Effects (Listeners & Body Scroll Lock)
    useEffect(() => {
        if (!attachment) return;

        // Prevent background scrolling while modal is open
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = originalStyle;
        };
    }, [attachment, onClose]);

    // SSR Guard & early return if nothing is selected
    if (!attachment || typeof window === 'undefined') {
        return null;
    }

    const src = attachment.view_url || attachment.download_url;

    // 2. Dynamic Max-Width layout logic based on file type
    // PDFs need breathing room; text fallbacks/images can be contained tighter.
    const maxWidthClass = isPdf
        ? 'max-w-6xl h-[90vh]'
        : isImage
          ? 'max-w-4xl'
          : 'max-w-md';

    return createPortal(
        <div
            className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-label={`Previewing ${attachment.original_name}`}
            onClick={onClose}
        >
            <div
                className={`flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all ${maxWidthClass} max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                    <div className="min-w-0">
                        <p
                            className="truncate text-sm font-semibold text-slate-800"
                            title={attachment.original_name}
                        >
                            {attachment.original_name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                            {attachment.mime_type} ·{' '}
                            {humanSize(attachment.file_size)}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            title="Open in new tab"
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ExternalLink size={16} />
                        </a>
                        <a
                            href={attachment.download_url}
                            title="Download"
                            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            <Download size={16} />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            title="Close"
                            className="ml-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body — rendered dynamically by MIME type */}
                <div className="flex min-h-75 flex-1 items-center justify-center overflow-auto bg-slate-50">
                    {isImage ? (
                        <div className="flex h-full w-full items-center justify-center p-4">
                            <img
                                src={src}
                                alt={attachment.original_name}
                                className="max-h-[75vh] w-auto max-w-full rounded object-contain shadow-sm select-none"
                            />
                        </div>
                    ) : isPdf ? (
                        <iframe
                            src={`${src}#view=FitH`}
                            title={attachment.original_name}
                            className="h-full min-h-[60vh] w-full border-0"
                        />
                    ) : (
                        /* Modernized Non-previewable Fallback State */
                        <div className="flex max-w-sm flex-col items-center gap-4 px-6 py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    No preview available
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    We can't display this file type directly in
                                    your browser. Download or open it to view.
                                </p>
                            </div>
                            <div className="mt-2 flex w-full gap-2">
                                <a
                                    href={src}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <ExternalLink size={14} /> Open Tab
                                </a>
                                <a
                                    href={attachment.download_url}
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                                >
                                    <Download size={14} /> Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
