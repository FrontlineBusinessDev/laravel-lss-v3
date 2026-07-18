import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { trainerAnnouncementService } from '@/api-service-layer/trainer/announcements';
import { AddRecordButton } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import type { Announcements } from '@/types/modules/announcements/announcements';
import { columns as baseColumns } from '@/types/modules/announcements/announcements';
import { AddAnnouncementModal } from './AddAnnouncementModal';

const PERMISSION = 'manage announcements';

const columns = baseColumns
    .filter((col) => col.key !== 'audience_type')
    .map((col) =>
        col.key === 'status'
            ? {
                  ...col,
                  render: (value: unknown) => (
                      <StatusBadge
                          status={value === 'active' ? 'active' : 'archived'}
                      />
                  ),
              }
            : col,
    );

/**
 * Batch-scoped announcements: create/edit is restricted to the trainer's own
 * assigned batch(es) (audience picker in AddAnnouncementModal only offers
 * those), and edit/archive/delete are further restricted server-side to
 * announcements this trainer authored (AnnouncementPolicy) — admin/developer
 * broadcasts reaching this trainer's batches show up read-only in the list.
 */
export default function TrainerAnnouncementsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Announcements | undefined>(
        undefined,
    );

    const closeModal = () => {
        setModalOpen(false);
        setEditing(undefined);
    };

    const invalidate = () =>
        tableListInvalidateKeys('trainer-announcements').forEach((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
        );

    return (
        <TrainerLayout title="Announcements">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                    Announcements you've posted, plus anything reaching your
                    assigned batches.
                </p>
                <AddRecordButton
                    label="New announcement"
                    permission={PERMISSION}
                    onClick={() => {
                        setEditing(undefined);
                        setModalOpen(true);
                    }}
                />
            </div>

            <DataTableCardField<Announcements>
                apiUrl="/trainer/announcements"
                apiQueryKey="trainer-announcements"
                columns={columns}
                defaultSortBy="created_at"
                defaultSortDir="desc"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                deleteConfirmText={(row) => row.subject}
                onEditRow={(row) => {
                    setEditing(row);
                    setModalOpen(true);
                }}
            />

            <AddAnnouncementModal
                open={modalOpen}
                mode={editing ? 'edit' : 'create'}
                announcement={editing}
                onClose={closeModal}
                onSubmit={async (values) => {
                    if (editing) {
                        await trainerAnnouncementService.update(
                            editing.id,
                            values,
                        );
                        toast({
                            title: 'Announcement updated',
                            variant: 'success',
                        });
                    } else {
                        await trainerAnnouncementService.create(values);
                        toast({
                            title: 'Announcement posted',
                            variant: 'success',
                        });
                    }
                    invalidate();
                    closeModal();
                }}
            />
        </TrainerLayout>
    );
}
