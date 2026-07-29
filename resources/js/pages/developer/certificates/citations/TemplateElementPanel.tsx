import { AlignCenter, AlignLeft, AlignRight, Crop, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { TextField } from '@/components/FormField';
import { cn } from '@/lib/utils';
import type { TemplateAlign, TemplateElement, TemplateShapeKind } from '../types';

const TEXT_TOKENS = [
  { value: '', label: 'Static text' },
  { value: 'recipientName', label: 'Recipient name' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'citationText', label: 'Citation text' },
  { value: 'certificateNo', label: 'Certificate no.' },
  { value: 'issuedDate', label: 'Issued date' },
];

const FONT_FAMILIES = [
  { value: '', label: 'Default' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: '"Great Vibes", cursive', label: 'Great Vibes (script)' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Courier New", monospace', label: 'Courier New' },
];

const SHAPE_KINDS: TemplateShapeKind[] = ['rectangle', 'circle'];

interface TemplateElementPanelProps {
  selected: TemplateElement | null;
  onUpdate: (id: string, patch: Partial<TemplateElement>) => void;
  onRemove: (id: string) => void;
  onCropImage?: (id: string) => void;
}

/** Contextual properties panel for the currently-selected canvas element. */
export function TemplateElementPanel({ selected, onUpdate, onRemove, onCropImage }: TemplateElementPanelProps) {
  if (!selected) {
    return (
      <div className="rounded-md border border-dashed border-neutral-200 p-3 text-center text-xs text-neutral-400" data-cy="template-element-panel-empty">
        Select an element to edit its properties.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-200 p-3" data-cy="template-element-panel-properties">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-600">Element properties</p>
        <button
          onClick={() => onRemove(selected.id)}
          className="rounded-sm p-1 text-neutral-400 hover:bg-danger-50 hover:text-danger-600"
          aria-label="Remove element"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <TextField
        label="Rotation (degrees)"
        type="number"
        min={-180}
        max={180}
        value={selected.rotation ?? 0}
        onChange={(e) => onUpdate(selected.id, { rotation: Number(e.target.value) })}
      />

      {selected.type === 'image' && (
        <>
          <TextField
            label="Image URL"
            value={selected.src ?? ''}
            placeholder="https://…"
            onChange={(e) => onUpdate(selected.id, { src: e.target.value })}
          />
          {selected.src && onCropImage && (
            <Button variant="secondary" size="sm" icon={Crop} className="mb-2.5 w-full" onClick={() => onCropImage(selected.id)}>
              Crop image
            </Button>
          )}
        </>
      )}

      {selected.type === 'line' && (
        <div className="mb-2.5">
          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Line color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selected.color || '#1f2937'}
              onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
              className="size-8 cursor-pointer rounded-md border border-neutral-200"
              aria-label="Line color"
            />
            <span className="text-xs text-neutral-500">{selected.color || '#1f2937'}</span>
          </div>
        </div>
      )}

      {selected.type === 'shape' && (
        <>
          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Shape</label>
          <div className="mb-2.5 flex items-center gap-1.5">
            {SHAPE_KINDS.map((k) => (
              <button
                key={k}
                onClick={() => onUpdate(selected.id, { shape: k })}
                className={cn(
                  'flex-1 rounded-md border px-2.5 py-1 text-xs font-medium capitalize',
                  (selected.shape ?? 'rectangle') === k ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500',
                )}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="mb-2.5 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-500">Fill</label>
              <input
                type="color"
                value={selected.fill && selected.fill !== 'transparent' ? selected.fill : '#ffffff'}
                onChange={(e) => onUpdate(selected.id, { fill: e.target.value })}
                className="size-8 cursor-pointer rounded-md border border-neutral-200"
                aria-label="Shape fill color"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-500">Stroke</label>
              <input
                type="color"
                value={selected.color || '#0b3d66'}
                onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
                className="size-8 cursor-pointer rounded-md border border-neutral-200"
                aria-label="Shape stroke color"
              />
            </div>
          </div>
          <button
            onClick={() => onUpdate(selected.id, { fill: 'transparent' })}
            className="mb-2.5 text-[11px] font-medium text-brand-600 hover:underline"
          >
            Make fill transparent
          </button>
          <TextField
            label="Stroke width"
            type="number"
            min={0}
            max={40}
            value={selected.strokeWidth ?? 2}
            onChange={(e) => onUpdate(selected.id, { strokeWidth: Number(e.target.value) })}
          />
        </>
      )}

      {selected.type === 'outcomes' && (
        <>
          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Columns</label>
          <div className="mb-2.5 flex items-center gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => onUpdate(selected.id, { columns: n })}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium',
                  (selected.columns ?? 2) === n ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <TextField
            label="Font size"
            type="number"
            min={8}
            max={32}
            value={selected.fontSize ?? 11}
            onChange={(e) => onUpdate(selected.id, { fontSize: Number(e.target.value) })}
          />
        </>
      )}

      {selected.type === 'text' && (
        <>
          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Content</label>
          <select
            value={selected.token ?? ''}
            onChange={(e) => onUpdate(selected.id, { token: e.target.value || undefined })}
            className="mb-2.5 h-8 w-full rounded-md border border-neutral-200 px-2 text-xs"
          >
            {TEXT_TOKENS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {!selected.token && (
            <TextField
              label="Static text"
              value={selected.text ?? ''}
              onChange={(e) => onUpdate(selected.id, { text: e.target.value })}
            />
          )}
          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Font family</label>
          <select
            value={selected.fontFamily ?? ''}
            onChange={(e) => onUpdate(selected.id, { fontFamily: e.target.value || undefined })}
            className="mb-2.5 h-8 w-full rounded-md border border-neutral-200 px-2 text-xs"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value || undefined }}>{f.label}</option>
            ))}
          </select>
          <TextField
            label="Font size"
            type="number"
            min={8}
            max={72}
            value={selected.fontSize ?? 14}
            onChange={(e) => onUpdate(selected.id, { fontSize: Number(e.target.value) })}
          />
          <div className="mb-2.5 flex items-center gap-1.5">
            {(['left', 'center', 'right'] as TemplateAlign[]).map((a) => {
              const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
              return (
                <button
                  key={a}
                  onClick={() => onUpdate(selected.id, { align: a })}
                  className={cn('rounded-md border p-1.5', selected.align === a ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500')}
                >
                  <Icon size={13} />
                </button>
              );
            })}
            <button
              onClick={() => onUpdate(selected.id, { fontWeight: selected.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={cn('rounded-md border px-2 py-1 text-xs font-bold', selected.fontWeight === 'bold' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-500')}
            >
              B
            </button>
          </div>
          <div className="mb-2.5">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500">Text color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selected.color || '#171717'}
                onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
                className="size-8 cursor-pointer rounded-md border border-neutral-200"
                aria-label="Text color"
              />
              <span className="text-xs text-neutral-500">{selected.color || '#171717'}</span>
            </div>
          </div>
        </>
      )}

      <TextField
        label="Width %"
        type="number"
        min={5}
        max={100}
        value={selected.width}
        onChange={(e) => onUpdate(selected.id, { width: Number(e.target.value) })}
      />
    </div>
  );
}
