import { Redo2, RotateCcw, Undo2 } from 'lucide-react';

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2;
const ZOOM_STEP = 0.05;

interface TemplateCanvasToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function clampZoom(z: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}

/** History controls + Photopea-style zoom slider (live %, direct entry, reset) shown above the template canvas. */
export function TemplateCanvasToolbar({ zoom, onZoomChange, undo, redo, canUndo, canRedo }: TemplateCanvasToolbarProps) {
  return (
    <div className="mb-2 flex shrink-0 items-center gap-2 border-b border-neutral-200 pb-2">
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
      <input
        type="range"
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={ZOOM_STEP}
        value={zoom}
        onChange={(e) => onZoomChange(clampZoom(Number(e.target.value)))}
        className="h-1.5 w-28 cursor-pointer accent-brand-500"
        aria-label="Zoom level"
      />
      <input
        type="number"
        min={Math.round(ZOOM_MIN * 100)}
        max={Math.round(ZOOM_MAX * 100)}
        step={5}
        value={Math.round(zoom * 100)}
        onChange={(e) => {
          const pct = Number(e.target.value);
          if (!Number.isNaN(pct)) onZoomChange(clampZoom(pct / 100));
        }}
        className="h-7 w-14 rounded-md border border-neutral-200 px-1.5 text-center text-[11px] font-medium text-neutral-600"
        aria-label="Zoom percentage"
      />
      <span className="text-[11px] text-neutral-400">%</span>

      <button
        type="button"
        onClick={() => onZoomChange(1)}
        disabled={zoom === 1}
        aria-label="Reset zoom to 100%"
        title="Reset zoom (100%)"
        className="ml-1 flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-[11px] font-medium text-neutral-500 disabled:pointer-events-none disabled:opacity-40 hover:bg-neutral-50"
      >
        <RotateCcw size={12} /> Reset
      </button>
    </div>
  );
}
