import {
    RequiredHoursCompletedPill,
    TaskCompletedPill,
} from '@/components/RatingsBadges';
import { StatCard } from '@/components/StatCard';
import { useToast } from '@/components/Toast';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import { ApiError } from '@/api-service-layer/client';
import { myInfoService } from '@/api-service-layer/trainee/my-info';
import { getHoursProgress } from '@/lib/ratings';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    ExternalLink,
    FileText,
    Fingerprint,
    Link2,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import { useState } from 'react';

const TABS = [
    'Personal Info',
    'Academic Info',
    'Documents',
    'Learning Outcomes',
    // 'Payment Details',
    // 'Ratings',
    'Certificate',
    'Biometrics',
] as const;
type Tab = (typeof TABS)[number];

interface Props {
    trainee: TraineeDetail;
    uploadableDocumentTypes: string[];
}

function Field({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                {label}
                {hint && <span className="text-neutral-400">({hint})</span>}
            </div>
            <div className="mt-1 text-sm text-ink">{value || '—'}</div>
        </div>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
            {children}
        </div>
    );
}

const currency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

function PersonalInfoSection({ trainee }: { trainee: TraineeDetail }) {
    return (
        <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Full name" value={trainee.name} />
                <Field label="Email address" value={trainee.email} />
                <Field
                    label="Birth date"
                    value={trainee.birthday?.slice(0, 10) ?? ''}
                />
                <Field label="Birth place" value={trainee.birth_place} />
                <Field label="Gender" value={trainee.gender} />
                <Field label="Mobile number" value={trainee.mobile_number} />
                <Field
                    label="Landline number"
                    value={trainee.landline_number ?? ''}
                />
                <Field
                    label="Emergency contact name"
                    value={trainee.emergency_contact_name}
                />
                <Field
                    label="Emergency contact number"
                    value={trainee.emergency_contact_number}
                />
                <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Address" value={trainee.address} />
                </div>
            </div>
        </Card>
    );
}

function AcademicInfoSection({ trainee }: { trainee: TraineeDetail }) {
    const hours = getHoursProgress(
        trainee.completed_hours,
        trainee.required_hours,
    );

    return (
        <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink">
                Academic & internship information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field
                    label="School"
                    value={trainee.school?.school_name ?? ''}
                />
                <Field
                    label="Academic program"
                    value={trainee.batch?.academic_program?.course_name ?? ''}
                />
                <Field
                    label="Academic level"
                    value={
                        trainee.batch?.academic_level
                            ? `${trainee.batch.academic_level.name} · ${trainee.batch.academic_level.year_level}`
                            : ''
                    }
                />
                <Field
                    label="Program type"
                    value={trainee.batch?.setup ?? ''}
                />
                <Field
                    label="Industry"
                    value={trainee.batch?.academic_industry?.name ?? ''}
                />
                <Field
                    label="Date started"
                    value={trainee.batch?.date_started?.slice(0, 10) ?? ''}
                    hint="from batch"
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Required hours" value={`${hours.required} hrs`} />
                <Field
                    label="Date completed"
                    value={trainee.date_completed?.slice(0, 10) ?? ''}
                />
            </div>

            {trainee.termination_remarks && (
                <div className="mt-5 rounded-md bg-danger-50 px-3.5 py-3">
                    <div className="text-xs font-medium text-danger-800">
                        Termination remarks
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-danger-800">
                        {trainee.termination_remarks}
                    </p>
                </div>
            )}

            <div className="mt-5 border-t border-neutral-100 pt-4">
                <div className="mb-1.5 text-xs font-medium text-neutral-600">
                    Progress
                </div>
                <div className="h-2 w-full overflow-hidden rounded-pill bg-neutral-100">
                    <div
                        className="h-full rounded-pill bg-brand-500"
                        style={{
                            width: `${hours.percent}%`,
                        }}
                    />
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500">
                    {hours.completed} of {hours.required} hrs completed
                    {hours.hoursComplete && <RequiredHoursCompletedPill />}
                </div>
            </div>
        </Card>
    );
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const ACCEPTED_LABEL = 'PDF, DOC, DOCX, JPG, or PNG';

const EXPECTED_DOCUMENTS: { type: string; label: string; optional: boolean }[] =
    [
        { type: 'resume', label: 'Resume', optional: false },
        {
            type: 'endorsement-letter',
            label: 'Endorsement Letter',
            optional: false,
        },
        { type: 'moa', label: 'MOA', optional: false },
        {
            type: 'liability-waiver',
            label: 'Liability Waiver',
            optional: false,
        },
        {
            type: 'scanned-evaluations',
            label: 'Scanned Evaluations',
            optional: true,
        },
    ];

type Mode = 'link' | 'upload';
interface DocState {
    id?: number;
    link?: string;
    savedLink?: string;
    submittedAt?: string;
    fileName?: string;
    fileSize?: number;
    viewUrl?: string;
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
        viewUrl: doc.view_url ?? undefined,
        mode: doc.file_path ? 'upload' : 'link',
    };
}

function formatSize(bytes: number) {
    return bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.ceil(bytes / 1024)} KB`;
}

function DocumentsSection({ trainee, uploadableDocumentTypes }: Props) {
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

    const setMode = (key: string, mode: Mode) =>
        setDocs((prev) => ({
            ...prev,
            [key]: { ...prev[key], mode, error: undefined },
        }));
    const setLink = (key: string, link: string) =>
        setDocs((prev) => ({ ...prev, [key]: { ...prev[key], link } }));

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
            const doc = await myInfoService.uploadDocument(body);
            setDocs((prev) => ({
                ...prev,
                [key]: {
                    ...toDocState(doc),
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
            await myInfoService.deleteDocument(id);
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

    const submittedCount = EXPECTED_DOCUMENTS.filter(
        ({ type }) => docs[type]?.link || docs[type]?.fileName,
    ).length;

    return (
        <Card>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-ink">
                        Required documents
                    </h3>
                    <p className="text-xs text-neutral-500">
                        Only Endorsement Letter, MOA, and Liability Waiver can
                        be submitted here.
                    </p>
                </div>
                <span className="text-xs text-neutral-500">
                    {submittedCount} / {EXPECTED_DOCUMENTS.length} submitted
                </span>
            </div>

            <div className="flex flex-col gap-3">
                {EXPECTED_DOCUMENTS.map((item) => {
                    const state = docs[item.type] ?? { mode: 'link' as Mode };
                    const hasSubmission = !!state.link || !!state.fileName;
                    const editable = uploadableDocumentTypes.includes(
                        item.type,
                    );
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
                                        {!editable && (
                                            <span className="text-xs font-normal text-neutral-400">
                                                {' '}
                                                · view only
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

                            {!editable ? (
                                hasSubmission ? (
                                    state.fileName ? (
                                        <a
                                            href={state.viewUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs font-medium text-ink hover:underline"
                                        >
                                            <FileText
                                                size={15}
                                                className="shrink-0 text-neutral-500"
                                            />
                                            {state.fileName}
                                        </a>
                                    ) : (
                                        <a
                                            href={state.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600"
                                        >
                                            Open link <ExternalLink size={10} />
                                        </a>
                                    )
                                ) : (
                                    <p className="text-xs text-neutral-400">
                                        Not submitted.
                                    </p>
                                )
                            ) : (
                                <>
                                    <div className="mb-2.5 inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-xs font-medium">
                                        <button
                                            onClick={() =>
                                                setMode(item.type, 'link')
                                            }
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
                                            onClick={() =>
                                                setMode(item.type, 'upload')
                                            }
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 transition-colors',
                                                state.mode === 'upload'
                                                    ? 'bg-white text-ink shadow-card'
                                                    : 'text-neutral-500 hover:text-neutral-700',
                                            )}
                                        >
                                            <UploadCloud size={12} /> Upload
                                            file
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
                                                        setLink(
                                                            item.type,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Paste document link (e.g. Google Drive URL)"
                                                    className="h-9 w-full rounded-md border border-neutral-200 bg-white pr-2.5 pl-8 text-xs text-ink transition-colors hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() =>
                                                    saveLink(item.type)
                                                }
                                                disabled={
                                                    state.uploading ||
                                                    !state.link?.trim() ||
                                                    state.link ===
                                                        state.savedLink
                                                }
                                                className="h-9 shrink-0 rounded-md bg-brand-500 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {state.uploading
                                                    ? 'Saving…'
                                                    : 'Save'}
                                            </button>
                                        </div>
                                    ) : state.uploading ? (
                                        <div className="flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-5 text-xs text-neutral-500">
                                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                                            Uploading…
                                        </div>
                                    ) : state.fileName ? (
                                        <div className="flex items-center justify-between gap-2 rounded-md border border-success-100 bg-success-50 px-3 py-2.5">
                                            <a
                                                href={state.viewUrl}
                                                target="_blank"
                                                rel="noreferrer"
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
                                                            ? formatSize(
                                                                  state.fileSize,
                                                              )
                                                            : ''}
                                                    </div>
                                                </div>
                                            </a>
                                            <button
                                                onClick={() =>
                                                    removeFile(item.type)
                                                }
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
                                            onDragLeave={() =>
                                                setDragOverKey(null)
                                            }
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
                                                type="file"
                                                accept={ACCEPTED_TYPES.join(
                                                    ',',
                                                )}
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleFile(
                                                        item.type,
                                                        e.target.files?.[0],
                                                    )
                                                }
                                            />
                                        </label>
                                    )}
                                    <p className="mt-1.5 text-[11px] text-neutral-400">
                                        Accepted formats: {ACCEPTED_LABEL} · Max
                                        file size: {MAX_FILE_SIZE_MB}MB
                                    </p>
                                    {state.error && (
                                        <p className="mt-1 text-[11px] font-medium text-danger-600">
                                            {state.error}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function LearningOutcomesSection({ trainee }: { trainee: TraineeDetail }) {
    const outcomes = trainee.outcomes ?? [];
    const achievedCount = outcomes.filter((o) => o.status === 'active').length;

    return (
        <Card>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-ink">
                        Learning outcomes
                    </h3>
                    <p className="text-xs text-neutral-500">
                        Outcomes associated with{' '}
                        {trainee.batch?.academic_industry?.name ??
                            'this industry'}
                        .
                    </p>
                </div>
                <span className="text-xs text-neutral-500">
                    {achievedCount} / {outcomes.length} achieved
                </span>
            </div>

            {outcomes.length === 0 ? (
                <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                    No learning outcomes configured for this industry.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {outcomes.map((o) => {
                        const checked = o.status === 'active';
                        return (
                            <div
                                key={o.id}
                                className={cn(
                                    'flex items-start gap-3 rounded-md border p-3',
                                    checked
                                        ? 'border-brand-200 bg-brand-50'
                                        : 'border-neutral-200',
                                )}
                            >
                                {checked ? (
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 shrink-0 text-brand-600"
                                    />
                                ) : (
                                    <Circle
                                        size={16}
                                        className="mt-0.5 shrink-0 text-neutral-300"
                                    />
                                )}
                                <span
                                    className={cn(
                                        'text-sm',
                                        checked ? 'text-brand-800' : 'text-ink',
                                    )}
                                >
                                    {o.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

function PaymentDetailsSection({ trainee }: { trainee: TraineeDetail }) {
    const outstanding = Number(trainee.outstanding_balance);

    return (
        <Card>
            <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
                <StatCard
                    label="Gross amount"
                    value={currency(trainee.gross_amount)}
                />
                <StatCard
                    label="Total discount"
                    value={currency(trainee.total_discount_amount)}
                />
                <StatCard
                    label="Net amount required"
                    value={currency(trainee.net_amount_required)}
                />
                <StatCard
                    label="Total paid"
                    value={currency(trainee.total_paid)}
                    tone="success"
                />
                <StatCard
                    label="Outstanding balance"
                    value={currency(outstanding)}
                    tone={outstanding > 0 ? 'warning' : 'default'}
                />
            </div>

            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">
                    Payment history
                </h3>
                <Link
                    href="/trainee/payments"
                    className="text-xs font-medium text-brand-600 hover:underline"
                >
                    View full payment history →
                </Link>
            </div>
            <div className="overflow-hidden rounded-md border border-neutral-200">
                <div className="lss-scrollbar overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                                <th className="px-3.5 py-2.5 font-medium">
                                    Date
                                </th>
                                <th className="px-3.5 py-2.5 font-medium">
                                    Amount
                                </th>
                                <th className="px-3.5 py-2.5 font-medium">
                                    Reference
                                </th>
                                <th className="px-3.5 py-2.5 font-medium">
                                    Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainee.payments.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-t border-neutral-100"
                                >
                                    <td className="px-3.5 py-2.5 text-neutral-600">
                                        {p.payment_date}
                                    </td>
                                    <td className="px-3.5 py-2.5 font-medium text-ink">
                                        {currency(p.amount_paid)}
                                    </td>
                                    <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600">
                                        {p.reference_no ?? '—'}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-neutral-600">
                                        {p.notes ?? '—'}
                                    </td>
                                </tr>
                            ))}
                            {trainee.payments.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-3.5 py-8 text-center text-sm text-neutral-500"
                                    >
                                        No payment transactions recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}

function RatingsSection({ trainee }: { trainee: TraineeDetail }) {
    const ratings = trainee.task_ratings ?? [];
    const allTasksCompleted =
        ratings.length > 0 && ratings.every((r) => r.rating != null);
    const hours = getHoursProgress(
        trainee.completed_hours,
        trainee.required_hours,
    );

    return (
        <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink">Ratings</h3>
            {ratings.length === 0 ? (
                <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                    No ratings recorded yet.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {allTasksCompleted && <TaskCompletedPill />}
                    {hours.hoursComplete && <RequiredHoursCompletedPill />}
                </div>
            )}
        </Card>
    );
}

function CertificateSection({ trainee }: { trainee: TraineeDetail }) {
    const cert = trainee.certificate;

    return (
        <Card>
            <h3 className="mb-4 text-sm font-semibold text-ink">Certificate</h3>
            {!cert ? (
                <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                    No certificate issued yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field
                        label="Certificate no."
                        value={cert.certificate_no}
                    />
                    <Field label="Citation" value={cert.citation?.name ?? ''} />
                    <Field
                        label="Issued on"
                        value={cert.issued_at?.slice(0, 10) ?? ''}
                    />
                </div>
            )}
        </Card>
    );
}

function BiometricsSection() {
    return (
        <Card>
            <div className="flex items-center gap-3">
                <Fingerprint size={20} className="shrink-0 text-neutral-400" />
                <div>
                    <h3 className="text-sm font-semibold text-ink">
                        Biometrics
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                        View your attendance/biometric records on the{' '}
                        <Link
                            href="/trainee/biometrics"
                            className="font-medium text-brand-600 hover:underline"
                        >
                            Biometrics page
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function MyInfoPage({
    trainee,
    uploadableDocumentTypes,
}: Props) {
    const [tab, setTab] = useState<Tab>('Personal Info');

    return (
        <TraineeLayout title="My Info">
            <div className="mb-4 flex flex-wrap gap-1 border-b border-neutral-200">
                {TABS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={cn(
                            'rounded-t-md px-3 py-2 text-sm font-medium transition-colors',
                            tab === t
                                ? 'border-b-2 border-brand-500 text-brand-600'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Personal Info' && (
                <PersonalInfoSection trainee={trainee} />
            )}
            {tab === 'Academic Info' && (
                <AcademicInfoSection trainee={trainee} />
            )}
            {tab === 'Documents' && (
                <DocumentsSection
                    trainee={trainee}
                    uploadableDocumentTypes={uploadableDocumentTypes}
                />
            )}
            {tab === 'Learning Outcomes' && (
                <LearningOutcomesSection trainee={trainee} />
            )}
            {/* {tab === 'Payment Details' && (
                <PaymentDetailsSection trainee={trainee} />
            )}
            {tab === 'Ratings' && <RatingsSection trainee={trainee} />} */}
            {tab === 'Certificate' && <CertificateSection trainee={trainee} />}
            {tab === 'Biometrics' && <BiometricsSection />}
        </TraineeLayout>
    );
}
