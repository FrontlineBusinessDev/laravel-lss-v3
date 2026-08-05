import { Image, ListChecks, Minus, PenTool, QrCode, Square, Type } from 'lucide-react';
import type { TemplateElementType } from '../types';

interface TemplateAddRailProps {
  onAdd: (type: TemplateElementType) => void;
}

const RAIL_ITEMS: { type: TemplateElementType; icon: typeof Type; label: string }[] = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'signature', icon: PenTool, label: 'Signature' },
  { type: 'shape', icon: Square, label: 'Shape' },
  { type: 'qr', icon: QrCode, label: 'QR' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'outcomes', icon: ListChecks, label: 'Outcomes' },
];

/** Canva-style vertical icon rail for adding elements to the canvas. */
export function TemplateAddRail({ onAdd }: TemplateAddRailProps) {
  return (
    <div className="flex flex-row gap-1.5 sm:flex-col" data-cy="template-add-rail-div">
      {RAIL_ITEMS.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type)}
          title={`Add ${label.toLowerCase()}`}
          aria-label={`Add ${label.toLowerCase()}`}
          className="flex size-11 flex-col items-center justify-center gap-0.5 rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
          data-cy={`template-add-rail-button-${type}`}
        >
          <Icon size={16} />
          <span className="text-[8px] leading-none">{label}</span>
        </button>
      ))}
    </div>
  );
}
