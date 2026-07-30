import { useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { cropTemplateImageToPngDataUrl } from './cropTemplateImage';

interface TemplateImageCropModalProps {
  /** The image URL to crop; modal is closed when null. */
  imageSrc: string | null;
  /** Width/height ratio to start the crop box at — matches the element's current box on canvas. */
  aspect: number;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

/** Crops a template image element's source, preserving PNG transparency (see cropTemplateImage.ts). */
export function TemplateImageCropModal({ imageSrc, aspect, onClose, onSave }: TemplateImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const dataUrl = await cropTemplateImageToPngDataUrl(imageSrc, croppedAreaPixels);
      onSave(dataUrl);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!imageSrc} onClose={onClose} title="Crop image" maxWidth={480} data-cy="template-image-crop-modal">
      <div className="relative h-72 w-full overflow-hidden rounded-md bg-neutral-100" data-cy="template-image-crop-modal-div-cropper">
        {imageSrc && (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, area) => setCroppedAreaPixels(area)}
          />
        )}
      </div>

      <input
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="mt-4 w-full accent-brand-500"
        aria-label="Zoom"
        data-cy="template-image-crop-modal-input-zoom"
      />

      <div className="mt-4 flex gap-2" data-cy="template-image-crop-modal-div-actions">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => void handleSave()} disabled={saving || !croppedAreaPixels}>
          {saving ? 'Cropping…' : 'Save crop'}
        </Button>
      </div>
    </Modal>
  );
}
