import {
    CheckCircle2,
    Circle,
    ExternalLink,
    FileText,
    Link2,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { AttachmentViewerModal, type ViewableAttachment } from '@/components/modal/AttachmentViewerModal';
import { useToast } from '@/components/Toast';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import TrainerTraineeDetailLayout from '@/layouts/trainees/TrainerTraineeDetailLayout';
import { apiFetchJson, ApiError } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const ACCEPTED_LABEL = 'PDF, DOC, DOCX, JPG, or PNG';
type Mode = 'link' | 'upload';

const EXPECTED_DOCUMENTS: { type: string; label: string; optional: boolean }[] =
    [
        { type: 'resume', label: 'Resume', optional: false },
        { type: 'endorsement-letter', label: 'Endorsement Letter', optional: false },
        { type: 'moa', label: 'MOA', optional: false },
        { type: 'liability-waiver', label: 'Liability Waiver', optional: false },
        { type: 'scanned-evaluations', label: 'Scanned Evaluations', optional: true },
    ];

interface DocState {
    id?: number;
    link?: string;
    savedLink?: string;
    submittedAt?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    viewUrl?: string;
    downloadUrl?: string;
    mode: Mode;
    error?: string;
    uploading?: boolean;
}

function toDocState(doc: TraineeDetail['documents'][number]): DocState {
    return {
        id: doc.id,
        link: doc.url_link ?? undefined,
        savedLink: doc.url_link ?? undefined,
        submittedAt: doc.created_at?.slice(0, 10),
        fileName: doc.original_name ?? doc.file_name ?? undefined,
        fileSize: doc.file_size ?? undefined,
        mimeType: doc.mime_type ?? undefined,
        viewUrl: doc.view_url ?? undefined,
        downloadUrl: doc.download_url ?? undefined,
        mode: doc.file_path ? 'upload' : 'link',
    };
}

/** Same upload mechanics as the admin DocumentsTab, scoped to /trainer/trainees/{id}/documents. */
export default function DocumentsTab({ trainee }: { trainee: TraineeDetail }) {
    const { showToast } = useToast();
    const [docs, setDocs] = useState<Record<string, DocState>>(() =>
        Object.fromEntries(
            EXPECTED_DOCUMENTS.map(({ type }) => {
                const row = trainee.documents.find(
                    (d) => d.document_type === type,
                );
                return [type, row ? toDocState(row) : { mode: 'link' as Mode }];
            }),
        ),
    );
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);
    const [previewing, setPreviewing] = useState<ViewableAttachment | null>(null);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const submittedCount = EXPECTED_DOCUMENTS.filter(
        ({ type }) => docs[type]?.link || docs[type]?.fileName,
    ).length;
    const setMode = (key: string, mode: Mode) => {
        setDocs((prev) => ({
            ...prev,
            [key]: { ...prev[key], mode, error: undefined },
        }));
    };
    const setLink = (key: string, link: string) => {
        setDocs((prev) => ({ ...prev, [key]: { ...prev[key], link } }));
    };
    const validateFile = (file: File) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_TYPES.includes(ext))
            return `File type not supported. Accepted: ${ACCEPTED_LABEL}.`;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
            return `File exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
        return null;
    };
    const upload = async (key: string, body: FormData) => {
        setDocs((prev) => ({
            ...prev,
            [key]: { ...prev[key], uploading: true, error: undefined },
        }));
        try {
            const res = await apiFetchJson<TraineeDetail['documents'][number]>(
                `/trainer/trainees/${trainee.id}/documents`,
                { method: 'POST', body },
            );
            setDocs((prev) => ({
                ...prev,
                [key]: {
                    ...toDocState(res.data),
                    mode: prev[key]?.mode ?? 'upload',
                },
            }));
            showToast('Document saved', 'success');
        } catch (err) {
            setDocs((prev) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    uploading: false,
                    error:
                        err instanceof ApiError
                            ? err.message
                            : 'Upload failed. Please try again.',
                },
            }));
        }
    };
    const handleFile = (key: string, file: File | undefined) => {
        if (!file) return;
        const error = validateFile(file);
        if (error) {
            setDocs((prev) => ({ ...prev, [key]: { ...prev[key], error } }));
            return;
        }
        const form = new FormData();
        form.append('document_type', key);
        form.append('file', file);
        upload(key, form);
    };
    const saveLink = (key: string) => {
        const link = docs[key]?.link?.trim();
        if (!link) return;
        const form = new FormData();
        form.append('document_type', key);
        form.append('url_link', link);
        upload(key, form);
    };
    const removeFile = async (key: string) => {
        const id = docs[key]?.id;
        if (!id) {
            setDocs((prev) => ({
                ...prev,
                [key]: { mode: prev[key]?.mode ?? 'upload' },
            }));
            return;
        }
        try {
            await apiFetchJson(`/trainer/trainees/${trainee.id}/documents/${id}`, {
                method: 'DELETE',
            });
            setDocs((prev) => ({
                ...prev,
                [key]: { mode: prev[key]?.mode ?? 'upload' },
            }));
            showToast('Document removed', 'success');
        } catch (err) {
            showToast(
                err instanceof ApiError ? err.message : 'Failed to remove document',
                'error',
            );
        }
    };
    const openPreview = (key: string) => {
        const doc = docs[key];
        if (!doc?.id || !doc.fileName) return;
        setPreviewing({
            id: doc.id,
            original_name: doc.fileName,
            mime_type: doc.mimeType ?? 'application/octet-stream',
            file_size: doc.fileSize ?? 0,
            view_url: doc.viewUrl ?? '',
            download_url: doc.downloadUrl ?? '',
        });
    };
    const formatSize = (bytes: number) =>
        bytes >= 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.ceil(bytes / 1024)} KB`;

    return (
        <TrainerLayout title="Trainee">
            <TrainerTraineeDetailLayout trainee={trainee}>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-ink">
                                Required documents
                            </h3>
                            <p className="text-xs text-neutral-500">
                                Paste a document link or upload a file
                                directly.
                            </p>
                        </div>
                        <span className="text-xs text-neutral-500">
                            {submittedCount} / {EXPECTED_DOCUMENTS.length}{' '}
                            submitted
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {EXPECTED_DOCUMENTS.map((item) => {
                            const state = docs[item.type] ?? {
                                mode: 'link' as Mode,
                            };
                            const hasSubmission =
                                !!state.link || !!state.fileName;
                            const isDragOver = dragOverKey === item.type;
                            return (
                                <div
                                    key={item.type}
                                    className="rounded-md border border-neutral-200 p-3.5"
                                >
                                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {hasSubmission ? (
                                                <CheckCircle2
                                                    size={15}
                                                    className="text-success-600"
                                                />
                                            ) : (
                                                <Circle
                                                    size={15}
                                                    className="text-neutral-300"
                                                />
                                            )}
                                            <span className="text-sm font-medium text-ink">
                                                {item.label}{' '}
                                                {item.optional && (
                                                    <span className="text-xs font-normal text-neutral-400">
                                                        (optional)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {state.submittedAt && (
                                            <span className="text-xs text-neutral-500">
                                                Submitted {state.submittedAt}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-2.5 inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-medium">
                                        <button
                                            onClick={() => setMode(item.type, 'link')}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-colors',
                                                state.mode === 'link'
                                                    ? 'bg-white text-ink shadow-card'
                                                    : 'text-neutral-500 hover:text-neutral-700',
                                            )}
                                        >
                                            <Link2 size={12} /> Paste link
                                        </button>
                                        <button
                                            onClick={() => setMode(item.type, 'upload')}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-colors',
                                                state.mode === 'upload'
                                                    ? 'bg-white text-ink shadow-card'
                                                    : 'text-neutral-500 hover:text-neutral-700',
                                            )}
                                        >
                                            <UploadCloud size={12} /> Upload file
                                        </button>
                                    </div>

                                    {state.mode === 'link' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Link2
                                                    size={13}
                                                    className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={state.link ?? ''}
                                                    onChange={(e) =>
                                                        setLink(item.type, e.target.value)
                                                    }
                                                    placeholder="Paste document link (e.g. Google Drive URL)"
                                                    className="h-9 w-full rounded-md border border-neutral-200 bg-white pr-2.5 pl-8 text-xs text-ink transition-colors hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() => saveLink(item.type)}
                                                disabled={
                                                    state.uploading ||
                                                    !state.link?.trim() ||
                                                    state.link === state.savedLink
                                                }
                                                className="h-9 shrink-0 rounded-md bg-brand-500 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {state.uploading ? 'Saving…' : 'Save'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {state.uploading ? (
                                                <div className="flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-5 text-xs text-neutral-500">
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                                                    Uploading…
                                                </div>
                                            ) : state.fileName ? (
                                                <div className="flex items-center justify-between gap-2 rounded-md border border-success-100 bg-success-50 px-3 py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPreview(item.type)}
                                                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                                    >
                                                        <FileText
                                                            size={15}
                                                            className="text-success-700 shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="truncate text-xs font-medium text-ink hover:underline">
                                                                {state.fileName}
                                                            </div>
                                                            <div className="text-[11px] text-neutral-500">
                                                                {state.fileSize
                                                                    ? formatSize(state.fileSize)
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => removeFile(item.type)}
                                                        aria-label="Remove file"
                                                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white hover:text-danger-600"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setDragOverKey(item.type);
                                                    }}
                                                    onDragLeave={() => setDragOverKey(null)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        setDragOverKey(null);
                                                        handleFile(
                                                            item.type,
                                                            e.dataTransfer.files?.[0],
                                                        );
                                                    }}
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-3 py-5 text-center transition-colors',
                                                        isDragOver
                                                            ? 'border-brand-400 bg-brand-50'
                                                            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100',
                                                    )}
                                                >
                                                    <UploadCloud
                                                        size={18}
                                                        className={
                                                            isDragOver
                                                                ? 'text-brand-500'
                                                                : 'text-neutral-400'
                                                        }
                                                    />
                                                    <span className="text-xs font-medium text-ink">
                                                        <span className="text-brand-600">
                                                            Click to upload
                                                        </span>{' '}
                                                        or drag and drop
                                                    </span>
                                                    <input
                                                        ref={(el) => {
                                                            fileInputRefs.current[item.type] = el;
                                                        }}
                                                        type="file"
                                                        accept={ACCEPTED_TYPES.join(',')}
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            handleFile(item.type, e.target.files?.[0])
                                                        }
                                                    />
                                                </label>
                                            )}
                                            <p className="mt-1.5 text-[11px] text-neutral-400">
                                                Accepted formats: {ACCEPTED_LABEL} · Max file
                                                size: {MAX_FILE_SIZE_MB}MB
                                            </p>
                                            {state.error && (
                                                <p className="mt-1 text-[11px] font-medium text-danger-600">
                                                    {state.error}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {state.link && state.mode === 'link' && (
                                        <a
                                            href={state.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-500 hover:text-brand-600"
                                        >
                                            Open link <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </TrainerTraineeDetailLayout>
            <AttachmentViewerModal
                attachment={previewing}
                onClose={() => setPreviewing(null)}
            />
        </TrainerLayout>
    );
}
