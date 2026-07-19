import { announcementService } from '@/api-service-layer/admin/announcement';
import { AddRecordButton } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableCardField from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import type { Announcements } from '@/types/modules/announcements/announcements';
import { columns as baseColumns } from '@/types/modules/announcements/announcements';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AddAnnouncementModal } from './AddAnnouncementModal';

const PERMISSION = 'manage announcements';

const columns = baseColumns.map((col) =>
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

export default function AnnouncementsPage() {
    const { showToast } = useToast();
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
        tableListInvalidateKeys('announcements').forEach((queryKey) =>
            queryClient.invalidateQueries({ queryKey }),
        );

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-ink">
                        Announcements
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Post and manage announcements sent to trainees.
                    </p>
                </div>
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
                apiUrl="/announcements"
                apiQueryKey="announcements"
                columns={columns}
                defaultSortBy="subject"
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
                        await announcementService.update(editing.id, values);
                        showToast('Announcement updated', 'success');
                    } else {
                        await announcementService.create(values);
                        showToast('Announcement posted', 'success');
                    }
                    invalidate();
                    closeModal();
                }}
            />
        </div>
    );
}
