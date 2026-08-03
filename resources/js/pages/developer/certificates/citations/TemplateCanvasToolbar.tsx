import { Redo2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5];

interface TemplateCanvasToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** History controls + zoom picker shown above the template canvas. */
export function TemplateCanvasToolbar({ zoom, onZoomChange, undo, redo, canUndo, canRedo }: TemplateCanvasToolbarProps) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
        className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 disabled:pointer-events-none disabled:opacity-40 hover:bg-neutral-50"
      >
        <Undo2 size={13} />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        aria-label="Redo"
        title="Redo (Ctrl+Shift+Z)"
        className="mr-1.5 rounded-md border border-neutral-200 p-1.5 text-neutral-500 disabled:pointer-events-none disabled:opacity-40 hover:bg-neutral-50"
      >
        <Redo2 size={13} />
      </button>
      <span className="text-[11px] font-medium text-neutral-500">Zoom</span>
      {ZOOM_LEVELS.map((z) => (
        <button
          key={z}
          type="button"
          onClick={() => onZoomChange(z)}
          className={cn('rounded-md border px-2 py-1 text-[11px] font-medium', zoom === z ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500')}
        >
          {Math.round(z * 100)}%
        </button>
      ))}
    </div>
  );
}
