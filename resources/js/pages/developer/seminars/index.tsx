import {
    seminarInput,
    seminarService,
} from '@/api-service-layer/admin/seminar';
import { useGlobalModal } from '@/components/global-modal';
import { AddRecordButton, SettingsListHeader } from '@/components/settings';
import DataTableCardField from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import SeminarPrimaryLayout from '@/layouts/seminar/SeminarPrimaryLayout';
import type { Seminar } from '@/types';
import { AppSeminar, columns } from '@/types/modules/seminar/seminar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { CreateEditSeminarModal } from './CreateEditSeminarModal';
const PERMISSION = 'manage seminars';

export default function SeminarsPage() {
    const { showToast } = useToast();

    const refreshRef = useRef<(() => void) | null>(null);

    const modal = useGlobalModal<Seminar | null>('seminar', null);

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
            tableListInvalidateKeys('seminar').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            showToast(isEdit ? 'Batch updated' : 'Batch created', 'success');
            closeModal();
        },
    });

    const customGRID = 'sm:grid-cols-[0.9fr_1.4fr_1.2fr_0.7fr_0.6fr_2.5rem]!';
    const listHeader = (
        <SettingsListHeader
            grid={customGRID}
            labels={[
                'Status',
                'Topic',
                'Date',
                'Participants',
                'Registration link',
            ]}
            data-cy="index-settings-list-header-1"
        />
    );

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
                onRefreshRef={(fn) => (refreshRef.current = fn)}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                data-cy="index-data-table-field-15"
            />

            <CreateEditSeminarModal
                open={modal.open}
                onClose={closeModal}
                onSubmit={async (values) => {
                    await mutation.mutateAsync(values);
                }}
                mode={isEdit ? 'edit' : 'create'}
                row={modal.data}
                data-cy="index-create-edit-seminar-modal-set-create-open"
            />
        </SeminarPrimaryLayout>
    );
}
