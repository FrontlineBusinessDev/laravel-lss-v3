import { Link, router, usePage } from '@inertiajs/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Archive,
    ArchiveRestore,
    ArrowLeft,
    Ban,
    Briefcase,
    Check,
    Copy,
    GraduationCap,
    Hash,
    Link2,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDeleteModal } from '@/components/modal/ConfirmDeleteModal';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { copyText } from '@/lib/clipboard';
import { cn } from '@/lib/utils';
import { CreateBatchModal } from '@/pages/developer/batches/CreateBatchModal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import type { StatusKind } from '@/types/reusable/status-kind';
import type { AppBatches } from '@/types/modules/batches/batches';

// Batch statuses onto the shared StatusBadge palette (inactive → archived).
const STATUS_BADGE: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};
type Confirm = {
    title: string;
    description: string;
    run: () => Promise<void>;
};

/**
 * Shared shell for the batch detail sub-routes (Trainees / Activity log /
 * Financials), the batch analog of SettingsPrimaryLayout: header + summary
 * cards + registration link + Link-based tab bar, with only the tab body
 * (`children`) changing per route. Header actions map to the real batch
 * endpoints — the same transitions the /batches list exposes.
 */
export default function BatchDetailLayout({
    batch,
    registrationUrl,
    children,
}: {
    batch: AppBatches;
    registrationUrl: string;
    children: ReactNode;
}) {
    const { showToast } = useToast();
    const { url } = usePage();
    const queryClient = useQueryClient();
    const path = url.split('?')[0];
    const [editOpen, setEditOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [confirm, setConfirm] = useState<Confirm | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const isActive = batch.status === 'active';
    const badge = STATUS_BADGE[batch.status] ?? 'active';
    const created = batch.created_at
        ? new Date(batch.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '—';
    const setupLabel = batch.setup === 'f2f' ? 'Face-to-face' : 'Online';
    const tabs = [
        {
            label: 'Trainees',
            href: `/batches/${batch.id}`,
        },
        {
            label: 'Activity log',
            href: `/batches/${batch.id}/activity-log`,
        },
        {
            label: 'Financials',
            href: `/batches/${batch.id}/financial`,
        },
        {
            label: 'Trainers',
            href: `/batches/${batch.id}/trainers`,
        },
    ];
    const mutate = async (
        method: 'PATCH' | 'DELETE',
        endpoint: string,
        okMsg: string,
        onDone: () => void,
    ) => {
        setBusy(true);
        try {
            await apiFetchJson(endpoint, {
                method,
            });
            tableListInvalidateKeys('batches').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            showToast(okMsg, 'info');
            onDone();
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : 'Action failed',
                'error',
            );
        } finally {
            setBusy(false);
            setConfirm(null);
        }
    };
    const handleCopy = async () => {
        const ok = await copyText(registrationUrl);
        if (!ok) {
            showToast('Please copy the link manually.', 'error');
            return;
        }
        setLinkCopied(true);
        showToast('Registration link copied', 'success');
        setTimeout(() => setLinkCopied(false), 1800);
    };
    return (
        <div data-cy="batch-detail-layout-div-1">
            <Link
                href="/batches"
                className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
                data-cy="batch-detail-layout-link-batches"
            >
                <ArrowLeft
                    size={14}
                    data-cy="batch-detail-layout-arrow-left-3"
                />
                Back to batches
            </Link>

            <div
                className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                data-cy="batch-detail-layout-div-4"
            >
                <div data-cy="batch-detail-layout-div-5">
                    <div
                        className="mb-1 flex items-center gap-2"
                        data-cy="batch-detail-layout-div-6"
                    >
                        <span
                            className="font-mono text-lg font-semibold text-ink"
                            data-cy="batch-detail-layout-span-7"
                        >
                            {batch.batch_code}
                        </span>
                        <StatusBadge
                            status={badge}
                            data-cy="batch-detail-layout-status-badge-8"
                        />
                    </div>
                    <p
                        className="text-xs text-neutral-500"
                        data-cy="batch-detail-layout-p-9"
                    >
                        {batch.academic_program?.name ?? '—'} ·{' '}
                        {batch.academic_industry?.name ?? '—'} · {setupLabel} ·
                        Created {created}
                    </p>
                </div>
                <div
                    className="flex flex-wrap gap-2"
                    data-cy="batch-detail-layout-div-10"
                >
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        onClick={() => setEditOpen(true)}
                        data-cy="batch-detail-layout-button-set-edit-open"
                    >
                        Edit
                    </Button>
                    {isActive ? (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={Archive}
                                disabled={busy}
                                onClick={() =>
                                    void mutate(
                                        'PATCH',
                                        `/batches/${batch.id}/archive`,
                                        'Batch archived',
                                        () => router.reload(),
                                    )
                                }
                                data-cy="batch-detail-layout-button-12"
                            >
                                Archive
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                icon={Ban}
                                disabled={busy}
                                onClick={() =>
                                    setConfirm({
                                        title: 'Terminate batch',
                                        description: `Set ${batch.batch_code} to terminated? You can restore it later.`,
                                        run: () =>
                                            mutate(
                                                'PATCH',
                                                `/batches/${batch.id}/terminate`,
                                                'Batch terminated',
                                                () => router.reload(),
                                            ),
                                    })
                                }
                                data-cy="batch-detail-layout-button-set-confirm"
                            >
                                Terminate
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={ArchiveRestore}
                                disabled={busy}
                                onClick={() =>
                                    void mutate(
                                        'PATCH',
                                        `/batches/${batch.id}/restore`,
                                        'Batch restored',
                                        () => router.reload(),
                                    )
                                }
                                data-cy="batch-detail-layout-button-14"
                            >
                                Restore
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                disabled={busy}
                                onClick={() => setDeleteOpen(true)}
                                data-cy="batch-detail-layout-button-set-confirm-2"
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Summary cards */}
            <div
                className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4"
                data-cy="batch-detail-layout-div-16"
            >
                <SummaryCard
                    icon={Hash}
                    label="Batch number"
                    data-cy="batch-detail-layout-summary-card-batch-number"
                >
                    <span
                        className="font-mono text-sm font-semibold text-ink"
                        data-cy="batch-detail-layout-span-18"
                    >
                        {batch.batch_code}
                    </span>
                </SummaryCard>
                <SummaryCard
                    icon={Users}
                    label="Trainees"
                    data-cy="batch-detail-layout-summary-card-trainees"
                >
                    <span
                        className="text-2xl font-semibold text-ink"
                        data-cy="batch-detail-layout-span-20"
                    >
                        {batch.trainees_count ?? 0}
                    </span>
                </SummaryCard>
                <SummaryCard
                    icon={Briefcase}
                    label="Industry"
                    data-cy="batch-detail-layout-summary-card-industry"
                >
                    <span
                        className="text-sm font-medium text-ink"
                        data-cy="batch-detail-layout-span-22"
                    >
                        {batch.academic_industry?.name ?? '—'}
                    </span>
                </SummaryCard>
                <SummaryCard
                    icon={GraduationCap}
                    label="Program type"
                    data-cy="batch-detail-layout-summary-card-program-type"
                >
                    <span
                        className="text-sm font-medium text-ink"
                        data-cy="batch-detail-layout-span-24"
                    >
                        {batch.academic_program?.name ?? '—'}
                    </span>
                </SummaryCard>
            </div>

            {/* Registration link */}
            <div
                className="mb-4 rounded-lg border border-neutral-200 bg-white p-3.5"
                data-cy="batch-detail-layout-div-25"
            >
                <div
                    className="mb-1.5 flex items-center gap-1.5 text-xs text-neutral-500"
                    data-cy="batch-detail-layout-div-registration-link"
                >
                    <Link2 size={13} data-cy="batch-detail-layout-link2-27" />{' '}
                    Registration link
                </div>
                <div
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    data-cy="batch-detail-layout-div-28"
                >
                    <code
                        className="min-w-0 flex-1 truncate rounded-md bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600"
                        data-cy="batch-detail-layout-code-29"
                    >
                        {registrationUrl}
                    </code>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={linkCopied ? Check : Copy}
                        onClick={handleCopy}
                        className="shrink-0"
                        data-cy="batch-detail-layout-button-copy"
                    >
                        {linkCopied ? 'Copied' : 'Copy link'}
                    </Button>
                </div>
                <p
                    className="mt-1.5 text-[11px] text-neutral-400"
                    data-cy="batch-detail-layout-p-trainees-who-open-this-link-land"
                >
                    Trainees who open this link land on the registration form
                    and are automatically associated with this batch.
                </p>
            </div>

            {/* Tab bar (Link-based, mirrors SettingsPrimaryLayout) */}
            <div
                className="mb-3 flex gap-5 border-b border-neutral-200 pl-0.5"
                data-cy="batch-detail-layout-div-32"
            >
                {tabs.map((t) => {
                    const active = path === t.href;
                    return (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={cn(
                                'pb-2.5 text-xs font-medium transition-colors',
                                active
                                    ? 'border-b-2 border-brand-500 text-ink'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                            data-cy="batch-detail-layout-link-t-href"
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>

            {children}

            <CreateBatchModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                batch={batch}
                onSaved={() => {
                    setEditOpen(false);
                    router.reload();
                }}
                data-cy="batch-detail-layout-create-batch-modal-set-edit-open"
            />

            <Modal
                open={confirm !== null}
                onClose={() => !busy && setConfirm(null)}
                title={confirm?.title ?? ''}
                description={confirm?.description}
                data-cy="batch-detail-layout-modal-35"
            >
                <div
                    className="mt-2 flex justify-end gap-2"
                    data-cy="batch-detail-layout-div-36"
                >
                    <button
                        type="button"
                        onClick={() => setConfirm(null)}
                        disabled={busy}
                        className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                        data-cy="batch-detail-layout-button-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => void confirm?.run()}
                        disabled={busy}
                        className="rounded-md bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600/90 disabled:opacity-60"
                        data-cy="batch-detail-layout-button-button-2"
                    >
                        {busy ? 'Working…' : 'Confirm'}
                    </button>
                </div>
            </Modal>

            <ConfirmDeleteModal
                open={deleteOpen}
                busy={busy}
                label={batch.batch_code}
                confirmText={batch.batch_code}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={() =>
                    void mutate(
                        'DELETE',
                        `/batches/${batch.id}`,
                        'Batch deleted',
                        () => router.visit('/batches'),
                    )
                }
                data-cy="batch-detail-layout-confirm-delete-modal"
            />
        </div>
    );
}
function SummaryCard({
    icon: Icon,
    label,
    children,
}: {
    icon: typeof Hash;
    label: string;
    children: ReactNode;
}) {
    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-3.5"
            data-cy="batch-detail-layout-div-39"
        >
            <div
                className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500"
                data-cy="batch-detail-layout-div-40"
            >
                <Icon size={13} data-cy="batch-detail-layout-icon-41" /> {label}
            </div>
            {children}
        </div>
    );
}
