import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import type { RowMenuAction } from '@/components/RowMenu';
import type { CardActions } from '@/types/reusable/card';

/**
 * Canonical Edit / Archive|Restore / Delete action set shared by every
 * archive-lifecycle settings list (academic modules, partner schools).
 *
 * Once a row is archived, Restore + Delete replace Archive, matching the app's
 * soft-delete flow. Permission gating comes straight from `CardActions`.
 */
export function buildRecordMenu(
    actions: CardActions,
    isArchived: boolean,
): RowMenuAction[] {
    return [
        {
            label: 'Edit',
            icon: Pencil,
            onClick: actions.onEdit,
            disabled: !actions.canEdit,
        },
        isArchived
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
        isArchived
            ? {
                  label: 'Delete',
                  icon: Trash2,
                  danger: true,
                  onClick: () => void actions.onDelete(),
                  disabled: !actions.canDelete,
              }
            : null,
    ];
}
