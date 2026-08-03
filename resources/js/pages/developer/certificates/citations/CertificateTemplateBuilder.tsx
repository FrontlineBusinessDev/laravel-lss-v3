import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { TextField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import { exportTemplateAsPdf, exportTemplateAsPng } from '../certificateExport';
import type { CertificateTemplate, CertificateType, TemplateElement, TemplateElementType } from '../types';
import { TemplateAddRail } from './TemplateAddRail';
import { TemplateCanvas } from './TemplateCanvas';
import { TemplateCanvasToolbar } from './TemplateCanvasToolbar';
import { TemplateElementPanel } from './TemplateElementPanel';
import { TemplateImageCropModal } from './TemplateImageCropModal';
import { TemplateLayersPanel } from './TemplateLayersPanel';
import { stageSize } from './templateStage';

const SAMPLE_TEXT: Record<string, string> = {
  recipientName: 'Juan Dela Cruz',
  subtitle: 'Sample School',
  citationText: 'This is to certify that Juan Dela Cruz has completed the program.',
  certificateNo: 'Certificate No. PREVIEW-0000',
  issuedDate: 'Issued July 17, 2026',
};

const SAMPLE_OUTCOMES = [
  'Design Website Mockup and UI using Figma',
  'Develop Responsive Web Design',
  'Apply basic scripting language using JavaScript',
  'Understand Laravel architecture and manage projects',
  'Design and implement databases using migrations',
  'Create and manage models, controllers, and routes',
];

const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_BORDER = '#0b3d66';

function resolveSampleText(el: TemplateElement): string {
  if (el.token) {
return SAMPLE_TEXT[el.token] ?? el.token;
}

  return el.text || 'Text';
}

interface CertificateTemplateBuilderProps {
  open: boolean;
  certificateType: CertificateType;
  initial?: CertificateTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}

function newElement(type: TemplateElementType): TemplateElement {
  return {
    id: `el-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type,
    x: 30,
    y: 40,
    width: type === 'line' ? 40 : 40,
    height: type === 'image' || type === 'qr' ? 15 : type === 'outcomes' ? 25 : type === 'shape' ? 20 : undefined,
    fontSize: type === 'text' ? 14 : type === 'outcomes' ? 11 : undefined,
    columns: type === 'outcomes' ? 2 : undefined,
    align: 'left',
    shape: type === 'shape' ? 'rectangle' : undefined,
    fill: type === 'shape' ? 'transparent' : undefined,
    strokeWidth: type === 'shape' ? 2 : undefined,
  };
}

function defaultOrientation(certificateType: CertificateType): 'portrait' | 'landscape' {
  return certificateType === 'trainee' ? 'portrait' : 'landscape';
}

export function CertificateTemplateBuilder({ open, certificateType, initial, onClose, onSaved }: CertificateTemplateBuilderProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation(certificateType));
  const {
    state: elements,
    set: setElements,
    reset: resetElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<TemplateElement[]>([], { shortcuts: true, enabled: open });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [borderColor, setBorderColor] = useState(DEFAULT_BORDER);
  const [croppingId, setCroppingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
return;
}

    setName(initial?.name ?? '');
    setOrientation(initial?.orientation ?? defaultOrientation(certificateType));
    resetElements(initial?.layout ?? []);
    setSelectedId(null);
    setZoom(1);
    setBackgroundColor(initial?.background_color || DEFAULT_BACKGROUND);
    setBorderColor(initial?.border_color || DEFAULT_BORDER);
  }, [open, initial, certificateType, resetElements]);

  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const cropping = elements.find((e) => e.id === croppingId) ?? null;
  const cropAspect = (() => {
    if (!cropping) {
return 1;
}

    const { width: sw, height: sh } = stageSize(orientation);
    const pxW = (cropping.width / 100) * sw;
    const pxH = ((cropping.height ?? 8) / 100) * sh;

    return pxH > 0 ? pxW / pxH : 1;
  })();

  function addElement(type: TemplateElementType) {
    const el = newElement(type);
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  function updateElement(id: string, patch: Partial<TemplateElement>) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function moveElement(id: string, x: number, y: number) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, x, y } : e)));
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));

    if (selectedId === id) {
setSelectedId(null);
}
  }

  async function handleExport(format: 'png' | 'pdf') {
    if (elements.length === 0) {
return;
}

    setExporting(format);

    try {
      const filename = `${(name.trim() || 'certificate-template').replace(/\s+/g, '-').toLowerCase()}.${format}`;
      const options = { achievedOutcomes: SAMPLE_OUTCOMES, backgroundColor, borderColor };

      if (format === 'png') {
        await exportTemplateAsPng(elements, orientation, resolveSampleText, filename, options);
      } else {
        await exportTemplateAsPdf(elements, orientation, resolveSampleText, filename, options);
      }
    } catch {
      showToast('Failed to export certificate.', 'error');
    } finally {
      setExporting(null);
    }
  }

  async function handleSave() {
    if (!name.trim() || elements.length === 0) {
return;
}

    setSaving(true);

    try {
      const payload = {
        certificate_type: certificateType,
        name: name.trim(),
        layout: elements,
        orientation,
        page_size: 'a4',
        background_color: backgroundColor,
        border_color: borderColor,
        status: initial?.status ?? 'active',
      };

      if (initial) {
        await apiFetchJson(`/certificates/templates/${initial.id}`, { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiFetchJson('/certificates/templates', { method: 'POST', body: JSON.stringify(payload) });
      }

      showToast(`Template "${payload.name}" saved.`, 'success');
      onSaved();
      onClose();
    } catch {
      showToast('Failed to save template.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit template' : 'New certificate template'} maxWidth={1560} data-cy="certificate-template-builder-modal">
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto_auto]">
        <TextField label="Template name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Landscape" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">Orientation</label>
          <div className="flex overflow-hidden rounded-md border border-neutral-200">
            {(['landscape', 'portrait'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                className={cn('flex-1 px-2.5 py-1.5 text-xs font-medium capitalize', orientation === o ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50')}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">Background</label>
          <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-8 w-14 cursor-pointer rounded-md border border-neutral-200" aria-label="Canvas background color" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">Border</label>
          <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="h-8 w-14 cursor-pointer rounded-md border border-neutral-200" aria-label="Canvas border color" />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <TemplateAddRail onAdd={addElement} />

        <div className="flex-1 overflow-x-auto">
          <TemplateCanvasToolbar zoom={zoom} onZoomChange={setZoom} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
          <TemplateCanvas
            elements={elements}
            selectedId={selectedId}
            orientation={orientation}
            zoom={zoom}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            onSelect={setSelectedId}
            onMove={moveElement}
            onTransform={updateElement}
          /> 
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-64">
          <TemplateLayersPanel elements={elements} selectedId={selectedId} onSelect={setSelectedId} onReorder={setElements} />
          <TemplateElementPanel selected={selected} onUpdate={updateElement} onRemove={removeElement} onCropImage={setCroppingId} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={elements.length === 0 || exporting !== null}
          onClick={() => void handleExport('png')}
        >
          {exporting === 'png' ? 'Exporting…' : 'Download PNG'}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          disabled={elements.length === 0 || exporting !== null}
          onClick={() => void handleExport('pdf')}
        >
          {exporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
        </Button>
        <Button variant="primary" className="flex-1" disabled={!name.trim() || elements.length === 0 || saving} onClick={handleSave}>
          Save template
        </Button>
      </div>

      <TemplateImageCropModal
        imageSrc={cropping?.src ?? null}
        aspect={cropAspect}
        onClose={() => setCroppingId(null)}
        onSave={(dataUrl) => cropping && updateElement(cropping.id, { src: dataUrl })}
      />
    </Modal>
  );
}
