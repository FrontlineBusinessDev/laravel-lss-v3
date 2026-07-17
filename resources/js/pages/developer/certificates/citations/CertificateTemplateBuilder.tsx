import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { CertificateTemplate, CertificateType, TemplateElement, TemplateElementType } from '../types';
import { TemplateCanvas } from './TemplateCanvas';
import { TemplateElementPanel } from './TemplateElementPanel';

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
    height: type === 'image' || type === 'qr' ? 15 : undefined,
    fontSize: type === 'text' ? 14 : undefined,
    align: 'left',
  };
}

export function CertificateTemplateBuilder({ open, certificateType, initial, onClose, onSaved }: CertificateTemplateBuilderProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setOrientation(initial?.orientation ?? 'landscape');
    setElements(initial?.layout ?? []);
    setSelectedId(null);
  }, [open, initial]);

  const selected = elements.find((e) => e.id === selectedId) ?? null;

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
    if (selectedId === id) setSelectedId(null);
  }

  async function handleSave() {
    if (!name.trim() || elements.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        certificate_type: certificateType,
        name: name.trim(),
        layout: elements,
        orientation,
        page_size: 'a4',
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
    <Modal open={open} onClose={onClose} title={initial ? 'Edit template' : 'New certificate template'} maxWidth={880} data-cy="certificate-template-builder-modal">
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
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
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 overflow-x-auto">
          <TemplateCanvas elements={elements} selectedId={selectedId} orientation={orientation} onSelect={setSelectedId} onMove={moveElement} />
        </div>
        <TemplateElementPanel selected={selected} onAdd={addElement} onUpdate={updateElement} onRemove={removeElement} />
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!name.trim() || elements.length === 0 || saving} onClick={handleSave}>
          Save template
        </Button>
      </div>
    </Modal>
  );
}
