import { useRef } from 'react';
import type { TemplateElement } from '../types';

interface TemplateCanvasProps {
  elements: TemplateElement[];
  selectedId: string | null;
  orientation: 'portrait' | 'landscape';
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const SAMPLE_TEXT: Record<string, string> = {
  recipientName: 'Juan Dela Cruz',
  subtitle: 'Sample School',
  citationText: 'This is to certify that Juan Dela Cruz has completed the program.',
  certificateNo: 'Certificate No. PREVIEW-0000',
  issuedDate: 'Issued July 17, 2026',
};

/** Absolutely-positioned drag canvas — pointer-events based, no external DnD library. */
export function TemplateCanvas({ elements, selectedId, orientation, onSelect, onMove }: TemplateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  function handlePointerDown(e: React.PointerEvent, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragId.current = id;
    onSelect(id);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragId.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    onMove(dragId.current, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  function handlePointerUp() {
    dragId.current = null;
  }

  const aspect = orientation === 'portrait' ? '1 / 1.4142' : '1.4142 / 1';

  return (
    <div
      ref={canvasRef}
      className="relative w-full max-w-2xl select-none border-[3px] border-brand-700 bg-white shadow-card"
      style={{ aspectRatio: aspect }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-cy="template-canvas-div"
    >
      {elements.map((el) => (
        <div
          key={el.id}
          onPointerDown={(e) => handlePointerDown(e, el.id)}
          onClick={() => onSelect(el.id)}
          className={`absolute cursor-move overflow-hidden border ${selectedId === el.id ? 'border-brand-500 bg-brand-50/40' : 'border-transparent hover:border-neutral-300'}`}
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: el.height ? `${el.height}%` : undefined,
            fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
            fontWeight: el.fontWeight,
            textAlign: el.align ?? 'left',
            color: el.color,
          }}
          data-cy="template-canvas-element"
        >
          {el.type === 'line' && <div className="h-px w-full bg-ink" />}
          {el.type === 'qr' && (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-300 text-[9px] text-neutral-400">QR</div>
          )}
          {el.type === 'image' && (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-neutral-300 text-[9px] text-neutral-400">Image</div>
          )}
          {el.type === 'text' && <span className="whitespace-pre-wrap">{el.token ? SAMPLE_TEXT[el.token] ?? el.token : el.text || 'Text'}</span>}
        </div>
      ))}
    </div>
  );
}
