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

/**
 * Crops `imageSrc` to `cropPixels` and returns a PNG data URL. Unlike
 * `lib/cropImage.ts`'s `getCroppedImageBlob` (JPEG, used for avatars), this
 * outputs PNG so a transparent-background source image (e.g. a logo/seal)
 * keeps its transparency instead of getting flattened onto an opaque
 * background. Returns a data URL (not a Blob) since template `src` values
 * are saved as plain strings straight into the `layout` JSON — there's no
 * file upload step for template images.
 */
export async function cropTemplateImageToPngDataUrl(imageSrc: string, cropPixels: Area): Promise<string> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    return canvas.toDataURL('image/png');
}
