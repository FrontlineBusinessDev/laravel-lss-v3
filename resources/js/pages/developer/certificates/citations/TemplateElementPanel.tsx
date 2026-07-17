import { AlignCenter, AlignLeft, AlignRight, Image, Minus, QrCode, Trash2, Type } from 'lucide-react';
import { Button } from '@/components/Button';
import { TextField } from '@/components/FormField';
import { cn } from '@/lib/utils';
import type { TemplateAlign, TemplateElement, TemplateElementType } from '../types';

const TEXT_TOKENS = [
  { value: '', label: 'Static text' },
  { value: 'recipientName', label: 'Recipient name' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'citationText', label: 'Citation text' },
  { value: 'certificateNo', label: 'Certificate no.' },
  { value: 'issuedDate', label: 'Issued date' },
];

interface TemplateElementPanelProps {
  selected: TemplateElement | null;
  onAdd: (type: TemplateElementType) => void;
  onUpdate: (id: string, patch: Partial<TemplateElement>) => void;
  onRemove: (id: string) => void;
}

export function TemplateElementPanel({ selected, onAdd, onUpdate, onRemove }: TemplateElementPanelProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:w-56" data-cy="template-element-panel-div">
      <div>
        <p className="mb-1.5 text-xs font-medium text-neutral-600">Add element</p>
        <div className="grid grid-cols-2 gap-1.5">
          <Button variant="secondary" size="sm" icon={Type} onClick={() => onAdd('text')}>Text</Button>
          <Button variant="secondary" size="sm" icon={Image} onClick={() => onAdd('image')}>Image</Button>
          <Button variant="secondary" size="sm" icon={QrCode} onClick={() => onAdd('qr')}>QR</Button>
          <Button variant="secondary" size="sm" icon={Minus} onClick={() => onAdd('line')}>Line</Button>
        </div>
      </div>

      {selected && (
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
      )}
    </div>
  );
}
