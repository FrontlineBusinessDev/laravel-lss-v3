import type { Area } from 'react-easy-crop';

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = src;
    });
}

/** Crops `imageSrc` to `cropPixels` (react-easy-crop's onCropComplete area) and returns a JPEG Blob. */
export async function getCroppedImageBlob(
    imageSrc: string,
    cropPixels: Area,
): Promise<Blob> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        cropPixels.width,
        cropPixels.height,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
            'image/jpeg',
            0.92,
        );
    });
}
