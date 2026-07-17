import { useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface AvatarCropModalProps {
    /** Object URL of the just-picked file; modal is closed when null. */
    imageSrc: string | null;
    uploadProgress: number | null;
    onClose: () => void;
    onSave: (blob: Blob) => Promise<void>;
}

export function AvatarCropModal({
    imageSrc,
    uploadProgress,
    onClose,
    onSave,
}: AvatarCropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [saving, setSaving] = useState(false);
    const isUploading = uploadProgress !== null;

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setSaving(true);
        try {
            const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
            await onSave(blob);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={!!imageSrc}
            onClose={onClose}
            title="Crop profile picture"
            maxWidth={480}
            data-cy="avatar-crop-modal-modal-title"
        >
            <div
                className="relative h-72 w-full overflow-hidden rounded-md bg-neutral-100"
                data-cy="avatar-crop-modal-div-cropper"
            >
                {imageSrc && (
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
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
                data-cy="avatar-crop-modal-input-zoom"
            />

            {isUploading && (
                <div
                    className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                    data-cy="avatar-crop-modal-div-progress-track"
                >
                    <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                        data-cy="avatar-crop-modal-div-progress-bar"
                    />
                </div>
            )}

            <div className="mt-4 flex gap-2" data-cy="avatar-crop-modal-div-actions">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                    disabled={saving || isUploading}
                    data-cy="avatar-crop-modal-button-cancel"
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || isUploading || !croppedAreaPixels}
                    data-cy="avatar-crop-modal-button-save"
                >
                    {isUploading ? `Uploading… ${uploadProgress}%` : 'Save changes'}
                </Button>
            </div>
        </Modal>
    );
}
