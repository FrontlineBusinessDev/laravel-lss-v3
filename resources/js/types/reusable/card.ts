/**
 * @file types/reusable/card.ts
 * Action bundle passed to a custom `renderCard` implementation so the caller
 * can wire the same edit/archive/restore/delete affordances the default card uses.
 */

export interface CardActions {
    onEdit: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void | Promise<void>;
    restoring: boolean;
    archiving: boolean;
    canEdit: boolean;
    canArchive: boolean;
    canDelete: boolean;
}
