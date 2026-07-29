import Konva from 'konva';
import { jsPDF } from 'jspdf';
import { splitIntoColumns, stageSize } from './citations/templateStage';
import type { TemplateElement } from './types';

const PIXEL_RATIO = 2;

export interface ExportOptions {
    achievedOutcomes?: string[];
    backgroundColor?: string;
    borderColor?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/** Ensures every custom font family used by text elements is actually loaded before Konva paints — a <link> tag alone doesn't guarantee readiness. */
async function ensureFontsLoaded(elements: TemplateElement[]): Promise<void> {
    const families = new Set(
        elements
            .filter((el) => el.type === 'text' && el.fontFamily)
            .map((el) => (el.fontFamily as string).split(',')[0].replace(/['"]/g, '').trim()),
    );
    await Promise.all([...families].map((family) => document.fonts.load(`16px "${family}"`).catch(() => undefined)));
}

/**
 * Builds an offscreen Konva stage for the given template + resolved text,
 * renders it, and returns the stage (caller must call `.destroy()` and
 * remove the container once done). QR-code elements are skipped — no QR
 * image generation is wired up yet, so a placeholder box has no place in a
 * finished, downloadable certificate.
 */
async function buildOffscreenStage(
    elements: TemplateElement[],
    orientation: 'portrait' | 'landscape',
    resolveText: (el: TemplateElement) => string,
    options: ExportOptions = {},
): Promise<{ stage: Konva.Stage; container: HTMLDivElement }> {
    const { width, height } = stageSize(orientation);
    const { achievedOutcomes = [], backgroundColor = '#ffffff', borderColor = '#0b3d66' } = options;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-10000px';
    container.style.left = '-10000px';
    document.body.appendChild(container);

    const stage = new Konva.Stage({ container, width, height });
    const layer = new Konva.Layer();
    stage.add(layer);

    const borderWidth = 6;
    layer.add(new Konva.Rect({ x: 0, y: 0, width, height, fill: backgroundColor }));
    layer.add(new Konva.Rect({ x: borderWidth / 2, y: borderWidth / 2, width: width - borderWidth, height: height - borderWidth, stroke: borderColor, strokeWidth: borderWidth }));

    const images = new Map<string, HTMLImageElement>();
    await Promise.all([
        ensureFontsLoaded(elements),
        ...elements
            .filter((el) => el.type === 'image' && el.src)
            .map(async (el) => {
                try {
                    images.set(el.id, await loadImage(el.src as string));
                } catch {
                    // Broken/unreachable image URL — element is simply omitted below.
                }
            }),
    ]);

    for (const el of elements) {
        const x = (el.x / 100) * width;
        const y = (el.y / 100) * height;
        const w = (el.width / 100) * width;
        const h = ((el.height ?? 8) / 100) * height;
        const rotation = el.rotation ?? 0;

        if (el.type === 'line') {
            layer.add(new Konva.Line({ x, y, rotation, points: [0, 0, w, 0], stroke: el.color || '#1f2937', strokeWidth: el.strokeWidth ?? 2 }));
        } else if (el.type === 'shape') {
            const strokeWidth = el.strokeWidth ?? 2;
            const fill = el.fill || 'transparent';
            const stroke = el.color || '#0b3d66';
            if (el.shape === 'circle') {
                layer.add(new Konva.Ellipse({
                    x: x + w / 2,
                    y: y + h / 2,
                    rotation,
                    radiusX: Math.max(0, w / 2 - strokeWidth / 2),
                    radiusY: Math.max(0, h / 2 - strokeWidth / 2),
                    fill,
                    stroke,
                    strokeWidth,
                }));
            } else {
                layer.add(new Konva.Rect({ x, y, rotation, width: w, height: h, fill, stroke, strokeWidth }));
            }
        } else if (el.type === 'image') {
            const image = images.get(el.id);
            if (image) layer.add(new Konva.Image({ x, y, rotation, width: w, height: h, image }));
        } else if (el.type === 'text') {
            layer.add(
                new Konva.Text({
                    x,
                    y,
                    rotation,
                    width: w,
                    height: h,
                    text: resolveText(el),
                    fontSize: el.fontSize ?? 14,
                    fontFamily: el.fontFamily || undefined,
                    fontStyle: el.fontWeight === 'bold' ? 'bold' : 'normal',
                    align: el.align ?? 'left',
                    fill: el.color || '#171717',
                    wrap: 'word',
                }),
            );
        } else if (el.type === 'outcomes') {
            const columns = el.columns ?? 2;
            const colWidth = w / columns;
            splitIntoColumns(achievedOutcomes, columns).forEach((group, i) => {
                layer.add(
                    new Konva.Text({
                        x: x + i * colWidth,
                        y,
                        rotation,
                        width: colWidth,
                        text: group.map((t) => `•  ${t}`).join('\n'),
                        fontSize: el.fontSize ?? 11,
                        fill: el.color || '#171717',
                        lineHeight: 1.4,
                        wrap: 'word',
                    }),
                );
            });
        }
        // type === 'qr': intentionally skipped, see doc comment above.
    }

    layer.draw();
    return { stage, container };
}

function downloadDataUrl(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export async function exportTemplateAsPng(
    elements: TemplateElement[],
    orientation: 'portrait' | 'landscape',
    resolveText: (el: TemplateElement) => string,
    filename: string,
    options: ExportOptions = {},
): Promise<void> {
    const { stage, container } = await buildOffscreenStage(elements, orientation, resolveText, options);
    try {
        downloadDataUrl(stage.toDataURL({ pixelRatio: PIXEL_RATIO }), filename);
    } finally {
        stage.destroy();
        container.remove();
    }
}

export async function exportTemplateAsPdf(
    elements: TemplateElement[],
    orientation: 'portrait' | 'landscape',
    resolveText: (el: TemplateElement) => string,
    filename: string,
    options: ExportOptions = {},
): Promise<void> {
    const { stage, container } = await buildOffscreenStage(elements, orientation, resolveText, options);
    try {
        const dataUrl = stage.toDataURL({ pixelRatio: PIXEL_RATIO });
        const { width, height } = stageSize(orientation);
        const pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [width * PIXEL_RATIO, height * PIXEL_RATIO],
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, width * PIXEL_RATIO, height * PIXEL_RATIO);
        pdf.save(filename);
    } finally {
        stage.destroy();
        container.remove();
    }
}
