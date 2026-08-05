import { ChevronDown, ChevronUp, Image, ListChecks, Minus, PenTool, QrCode, Square, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TemplateElement } from '../types';
import { reorder } from './templateStage';

interface TemplateLayersPanelProps {
  elements: TemplateElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (elements: TemplateElement[]) => void;
}

const TYPE_ICON: Record<TemplateElement['type'], typeof Type> = {
  text: Type,
  image: Image,
  qr: QrCode,
  line: Minus,
  outcomes: ListChecks,
  shape: Square,
  signature: PenTool,
};

function elementLabel(el: TemplateElement): string {
  if (el.type === 'text') {
    if (el.token) return el.token.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
    return el.text?.slice(0, 24) || 'Text';
  }
  if (el.type === 'outcomes') return 'Learning outcomes';
  return el.type.charAt(0).toUpperCase() + el.type.slice(1);
}

/** Canva-style layers list — topmost element first, click to select, arrows to reorder. */
export function TemplateLayersPanel({ elements, selectedId, onSelect, onReorder }: TemplateLayersPanelProps) {
  const topmostFirst = [...elements].reverse();

  return (
    <div className="rounded-md border border-neutral-200 p-2" data-cy="template-layers-panel-div">
      <p className="mb-1.5 px-1 text-xs font-medium text-neutral-600">Layers</p>
      <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto lss-scrollbar">
        {topmostFirst.length === 0 && <p className="px-1 text-[11px] text-neutral-400">No elements yet</p>}
        {topmostFirst.map((el) => {
          const Icon = TYPE_ICON[el.type];
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs',
                isSelected ? 'bg-brand-50 text-brand-700' : 'text-neutral-600 hover:bg-neutral-50',
              )}
              data-cy="template-layers-panel-row"
            >
              <button type="button" onClick={() => onSelect(el.id)} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                <Icon size={13} className="shrink-0" />
                <span className="truncate">{elementLabel(el)}</span>
              </button>
              <button
                type="button"
                onClick={() => onReorder(reorder(elements, el.id, 'forward'))}
                aria-label="Move layer up"
                className="rounded-sm p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => onReorder(reorder(elements, el.id, 'backward'))}
                aria-label="Move layer down"
                className="rounded-sm p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
