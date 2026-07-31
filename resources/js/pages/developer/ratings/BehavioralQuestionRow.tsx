import { Archive, GripVertical, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import type { BehavioralQuestion } from '@/types/modules/ratings/behavioral';
import { TYPE_LABEL } from './behavioralConstants';

interface Props {
    question: BehavioralQuestion;
    draggable: boolean;
    dragging: boolean;
    busy: boolean;
    onEdit: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
}

/**
 * One question row in the Behavioral Setup list. Active questions can only
 * be edited or archived; archived questions can only be restored or deleted
 * — an archived question is never directly editable, and an active one is
 * never directly deletable (must be archived first).
 */
export function BehavioralQuestionRow({
    question: q,
    draggable,
    dragging,
    busy,
    onEdit,
    onArchive,
    onRestore,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: Props) {
    const isActive = q.status === 'active';

    return (
        <div
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`flex items-start justify-between gap-3 px-4 py-3 ${dragging ? 'opacity-40' : ''}`}
        >
            <div className="flex min-w-0 items-start gap-2">
                {draggable && (
                    <span
                        className="mt-0.5 shrink-0 cursor-grab text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
                        title="Drag to reorder"
                    >
                        <GripVertical size={14} />
                    </span>
                )}
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm text-ink">{q.question}</span>
                        <span className="rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                            {TYPE_LABEL[q.type]}
                        </span>
                        {q.is_critical && (
                            <span className="rounded-pill bg-warning-50 px-1.5 py-0.5 text-[10px] font-medium text-warning-700">
                                Critical
                            </span>
                        )}
                        {!isActive && (
                            <span className="rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                                Archived
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                {isActive ? (
                    <>
                        <button
                            type="button"
                            onClick={onEdit}
                            title="Edit"
                            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={onArchive}
                            disabled={busy}
                            title="Archive"
                            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                        >
                            <Archive size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onRestore}
                            disabled={busy}
                            title="Restore"
                            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={busy}
                            title="Delete"
                            className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50"
                        >
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
