import { announcementService } from '@/api-service-layer/admin/announcement';
import { RowMenuAction } from '@/components/RowMenu';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import { formatDateTime } from '@/lib/date';
import type { Announcements } from '@/types/modules/announcements/announcements';
import { columns as baseColumns } from '@/types/modules/announcements/announcements';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AddAnnouncementModal } from './AddAnnouncementModal';

const PERMISSION = 'manage announcements';

const GRID = 'sm:grid-cols-[1.6fr_1fr_1.2fr_1.2fr_2.5rem]!';
const listHeader = (
    <SettingsListHeader
        grid={GRID}
        labels={['Subject', 'Audience Type', 'Scheduled at', 'Status']}
        data-cy="index-settings-list-header-1"
    />
);

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

    const renderRow = (row: Announcements, actions: CardActions) => {
        const nonActive = row.status !== 'active';
        const menu: RowMenuAction[] = [
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
                      disabled: !actions.canDelete || !nonActive,
                  }
                : {
                      label: 'Edit',
                      icon: Pencil,
                      onClick: actions.onEdit,
                      disabled: !actions.canEdit,
                  },
        ];

        return (
            <div key={row.id}>
                <SettingsRow
                    grid={GRID}
                    isArchived={nonActive}
                    badge={
                        <StatusBadge
                            status={
                                row.status === 'active' ? 'active' : 'archived'
                            }
                        />
                    }
                    menu={menu}
                    data-cy="index-settings-row-1"
                >
                    <TextCell muted={false} className="truncate">
                        {row.subject}
                    </TextCell>
                    <TextCell muted={false} className="truncate">
                        {row.audience_type}
                    </TextCell>
                    <TextCell muted={false} className="truncate">
                        {formatDateTime(row.scheduled_at)}
                    </TextCell>
                </SettingsRow>
            </div>
        );
    };

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
                viewType="table"
                deleteConfirmText={(row) => row.subject}
                onEditRow={(row) => {
                    setEditing(row);
                    setModalOpen(true);
                }}
                listHeader={listHeader}
                renderCard={renderRow}
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
