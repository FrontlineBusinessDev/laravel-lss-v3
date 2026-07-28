import {
    seminarInput,
    seminarService,
} from '@/api-service-layer/admin/seminar';
import { useGlobalModal } from '@/components/global-modal';
import { RowMenuAction } from '@/components/RowMenu';
import { SeminarRow } from '@/components/seminar/SeminarRow';
import {
    AddRecordButton,
    SettingsListHeader,
    TextCell,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { CardActions } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import { useSeminarLinkActions } from '@/hooks/use-seminar-link-actions';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { Seminar, StatusKind } from '@/types';
import { AppSeminar, columns } from '@/types/modules/seminar/seminar';
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
import { useRef } from 'react';
import { CreateEditSeminarModal } from './CreateEditSeminarModal';
import { formatDate } from './seminarUtils';
const PERMISSION = 'manage seminars';

const STATUS_BADGE: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

export default function SeminarsPage() {
    const { showToast } = useToast();

    const refreshRef = useRef<(() => void) | null>(null);

    const modal = useGlobalModal<Seminar | null>('seminar', null);
    const linkActions = useSeminarLinkActions();

    const closeModal = () => {
        modal.setOpen(false);
        modal.setData(null);
    };
    const isEdit = modal.data !== null;
    const queryClient = useQueryClient();
    // CreateBatchModal owns its own field state, so it can't ride on FormModal.
    // Wire a mutation directly (mirroring FormModal's success → invalidate →
    // toast → close); on error the modal keeps itself open with inline messages.
    const mutation = useMutation<AppSeminar, Error, Record<string, unknown>>({
        mutationFn: (payload) =>
            (isEdit && modal.data
                ? seminarService.update(modal.data.id, payload as seminarInput)
                : seminarService.create(
                      payload as seminarInput,
                  )) as Promise<AppSeminar>,
        onSuccess: () => {
            tableListInvalidateKeys('seminars').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            showToast(isEdit ? 'Batch updated' : 'Batch created', 'success');
            closeModal();
        },
    });

    const customGRID = 'sm:grid-cols-[0.9fr_0.7fr_1.4fr_1.2fr_0.7fr_2.5rem]!';
    const listHeader = (
        <SettingsListHeader
            grid={customGRID}
            labels={['Status', 'Seminar code', 'Topic', 'Date', 'Participants']}
            data-cy="index-settings-list-header-1"
        />
    );

    const renderRow = (row: AppSeminar, actions: CardActions) => {
        // `inactive` is the archive state; completed/terminated are lifecycle
        // end-states. All non-active rows expose Restore + Delete (like the
        // settings lists); only active rows can be Archived or Terminated.
        const nonActive = row.status !== 'active';
        const badge: StatusKind = STATUS_BADGE[row.status] ?? 'active';
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
                onClick: () => {},
                // onClick: () => setQrTarget(row),
            },
            {
                label: 'Copy link',
                icon: Link2,
                onClick: () => {},
                // onClick: () => void linkActions.copy(row),
            },
            nonActive
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: () => {},
                      //   onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: () => {},
                      //   onClick: actions.onArchive,
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
                      onClick: () => {},
                      //   onClick: () => setTerminateTarget(row),
                  },
        ];

        return (
            // Clicking anywhere on the row opens the batch detail page. The
            // RowMenu button + items stopPropagation, so menu actions never
            // trigger navigation.
            <div
                role="link"
                tabIndex={0}
                onClick={() =>
                    router.visit(`/seminars/list-of-seminars/${row.id}`)
                }
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        router.visit(`/seminars/list-of-seminars/${row.id}`);
                    }
                }}
                className="cursor-pointer transition-colors hover:bg-neutral-50/70"
                data-cy="index-div-2"
            >
                <SeminarRow
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
                        {row.seminar_code}
                    </TextCell>
                    <TextCell data-cy="index-text-cell-5">{row.topic}</TextCell>
                    <TextCell muted data-cy="index-text-cell-6">
                        {formatDate(row.date?.slice(0, 4)) ?? '—'}
                    </TextCell>
                    <TextCell muted data-cy="index-text-cell-7">
                        {row.max_participants ?? '—'}/
                        {row.max_participants ?? '—'}
                    </TextCell>
                </SeminarRow>
            </div>
        );
    };

    return (
        <SeminarPrimaryLayout
            actionNode={
                <AddRecordButton
                    label="Add seminar"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            }
        >
            <DataTableCardField<AppSeminar>
                apiUrl="/seminars/list-of-seminars"
                apiQueryKey="seminars"
                columns={columns}
                defaultSortBy="seminar_code"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                deleteConfirmText={(row) => row.seminar_code}
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
                <CreateEditSeminarModal
                    open
                    onClose={closeModal}
                    onSubmit={async (values) => {
                        await mutation.mutateAsync(values);
                    }}
                    mode={isEdit ? 'edit' : 'create'}
                    row={modal.data}
                    data-cy="index-create-edit-seminar-modal-set-create-open"
                />
            )}
        </SeminarPrimaryLayout>
    );
}
