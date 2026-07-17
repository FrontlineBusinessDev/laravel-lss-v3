import { router } from '@inertiajs/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Archive,
    ArchiveRestore,
    Ban,
    Link2,
    Pencil,
    QrCode,
    Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { batchService } from '@/api-service-layer/admin/batch';
import type { BatchInput } from '@/api-service-layer/admin/batch';
import { useGlobalModal } from '@/components/global-modal';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { Switch } from '@/components/Switch';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useBatchLinkActions } from '@/hooks/use-batch-link-actions';
import { useToast } from '@/hooks/use-toast';
import type { StatusKind } from '@/types';
import type { AppBatches } from '@/types/modules/batches/batches';
import { columns } from '@/types/modules/batches/batches';
import { BatchRegistrationModal } from './BatchRegistrationModal';
import { CreateBatchModal } from './CreateBatchModal';

const PERMISSION = 'manage batches';

const customGRID =
    'sm:grid-cols-[0.9fr_1.4fr_1.2fr_0.7fr_0.6fr_1fr_1.5fr_2.5rem]!';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Batch Code', 'Program', 'Industry', 'Setup', 'Trainees']}
        data-cy="index-settings-list-header-1"
    />
);

// Batch statuses map onto the shared StatusBadge palette. `inactive` has no
// dedicated badge, so it renders with the neutral "archived" style.
const STATUS_BADGE: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};
export default function BatchesListPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const modal = useGlobalModal<AppBatches | null>('batch', null);
    const isEdit = modal.data !== null;
    // Escape hatch to the table's refetch, so the custom Terminate action can
    // refresh the list without going through the built-in mutations.
    const refreshRef = useRef<(() => void) | null>(null);
    const [qrTarget, setQrTarget] = useState<AppBatches | null>(null);
    const [terminateTarget, setTerminateTarget] = useState<AppBatches | null>(
        null,
    );
    const [terminating, setTerminating] = useState(false);
    const linkActions = useBatchLinkActions();

    const closeModal = () => {
        modal.setOpen(false);
        modal.setData(null);
    };

    // CreateBatchModal owns its own field state, so it can't ride on FormModal.
    // Wire a mutation directly (mirroring FormModal's success → invalidate →
    // toast → close); on error the modal keeps itself open with inline messages.
    const mutation = useMutation<AppBatches, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            (isEdit && modal.data
                ? batchService.update(modal.data.id, payload as BatchInput)
                : batchService.create(
                      payload as BatchInput,
                  )) as Promise<AppBatches>,
        onSuccess: () => {
            tableListInvalidateKeys('batches').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            toast({
                title: isEdit ? 'Batch updated' : 'Batch created',
                variant: 'success',
            });
            closeModal();
        },
    });

    const confirmTerminate = async () => {
        if (!terminateTarget) {
            return;
        }

        setTerminating(true);

        try {
            await batchService.terminate(terminateTarget.id);
            toast({
                title: 'Batch terminated',
                variant: 'info',
            });
            refreshRef.current?.();
            setTerminateTarget(null);
        } catch (err) {
            toast({
                title: 'Terminate failed',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Failed to terminate batch.',
                variant: 'error',
            });
        } finally {
            setTerminating(false);
        }
    };
    const renderRow = (row: AppBatches, actions: CardActions) => {
        // `inactive` is the archive state; completed/terminated are lifecycle
        // end-states. All non-active rows expose Restore + Delete (like the
        // settings lists); only active rows can be Archived or Terminated.
        const nonActive = row.status !== 'active';
        const badge: StatusKind = STATUS_BADGE[row.status] ?? 'active';
        const linkEnabled = linkActions.isEnabled(row);
        const menu: RowMenuAction[] = [
            {
                label: 'Edit',
                icon: Pencil,
                onClick: actions.onEdit,
                disabled: !actions.canEdit,
            },
            {
                label: 'Registration QR',
                icon: QrCode,
                onClick: () => setQrTarget(row),
            },
            {
                label: 'Copy link',
                icon: Link2,
                onClick: () => void linkActions.copy(row),
            },
            nonActive
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: actions.onArchive,
                      disabled: !actions.canArchive,
                  },
            nonActive
                ? {
                      label: 'Delete',
                      icon: Trash2,
                      danger: true,
                      onClick: () => void actions.onDelete(),
                      disabled: !actions.canDelete,
                  }
                : {
                      label: 'Terminate',
                      icon: Ban,
                      danger: true,
                      onClick: () => setTerminateTarget(row),
                  },
        ];

        return (
            // Clicking anywhere on the row opens the batch detail page. The
            // RowMenu button + items stopPropagation, so menu actions never
            // trigger navigation.
            <div
                role="link"
                tabIndex={0}
                onClick={() => router.visit(`/batches/${row.id}`)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        router.visit(`/batches/${row.id}`);
                    }
                }}
                className="cursor-pointer transition-colors hover:bg-neutral-50/70"
                data-cy="index-div-2"
            >
                <SettingsRow
                    grid={customGRID}
                    isArchived={nonActive}
                    badge={
                        <StatusBadge
                            status={badge}
                            data-cy="index-status-badge-4"
                        />
                    }
                    menu={menu}
                    data-cy="index-settings-row-3"
                >
                    <TextCell data-cy="index-text-cell-5">
                        {row.batch_code}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-6">
                        {row.academic_program?.name ?? '—'}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-7">
                        {row.academic_industry?.name ?? '—'}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-8">
                        {row.setup === 'f2f' ? 'F2F' : 'Online'}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-9">
                        {row.trainees_count ?? 0}{' '}
                        <span
                            className="md:hidden"
                            data-cy="index-span-trainee-s"
                        >
                            Trainee(s)
                        </span>
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-11">
                        <Switch
                            checked={linkEnabled}
                            ariaLabel={
                                linkEnabled
                                    ? 'Disable public link'
                                    : 'Enable public link'
                            }
                            label={
                                linkEnabled ? 'Link Enabled' : 'Link Disabled'
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                void linkActions.toggle(row);
                            }}
                            data-cy="index-switch-12"
                        />
                    </TextCell>
                </SettingsRow>
            </div>
        );
    };

    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1
                        className="text-xl font-semibold text-ink"
                        data-cy="index-h1-batches"
                    >
                        Batches
                    </h1>
                    <p
                        className="text-sm text-neutral-500"
                        data-cy="index-p-manage-batches-data"
                    >
                        Manage Batches data.
                    </p>
                </div>
                <AddRecordButton
                    label="Add batch"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <DataTableCardField<AppBatches>
                apiUrl="/batches"
                apiQueryKey="batches"
                columns={columns}
                defaultSortBy="batch_code"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                deleteConfirmText={(row) => row.batch_code}
                listHeader={listHeader}
                renderCard={renderRow}
                onRefreshRef={(fn) => (refreshRef.current = fn)}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                data-cy="index-data-table-field-15"
            />

            {modal.open && (
                <CreateBatchModal
                    open
                    mode={isEdit ? 'edit' : 'create'}
                    batch={modal.data ?? undefined}
                    onClose={closeModal}
                    onSubmit={async (values) => {
                        await mutation.mutateAsync(values);
                    }}
                    data-cy="index-create-batch-modal-16"
                />
            )}

            <BatchRegistrationModal
                batchId={qrTarget?.id ?? null}
                batchCode={qrTarget?.batch_code}
                onClose={() => setQrTarget(null)}
                data-cy="index-batch-registration-modal-set-qr-target"
            />

            {/* Terminate confirmation */}
            <Modal
                open={terminateTarget !== null}
                onClose={() => !terminating && setTerminateTarget(null)}
                title="Terminate batch"
                description={
                    terminateTarget
                        ? `Set ${terminateTarget.batch_code} to terminated? You can restore it later.`
                        : undefined
                }
                data-cy="index-modal-terminate-batch"
            >
                <div
                    className="mt-2 flex justify-end gap-2"
                    data-cy="index-div-19"
                >
                    <button
                        type="button"
                        onClick={() => setTerminateTarget(null)}
                        disabled={terminating}
                        className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                        data-cy="index-button-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={confirmTerminate}
                        disabled={terminating}
                        className="rounded-md bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600/90 disabled:opacity-60"
                        data-cy="index-button-button-2"
                    >
                        {terminating ? 'Terminating…' : 'Terminate'}
                    </button>
                </div>
            </Modal>
        </>
    );
}
