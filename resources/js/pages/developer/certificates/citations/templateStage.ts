import type { TemplateElement } from '../types';

/**
 * Konva stages are authored in a fixed "design space" regardless of the
 * on-screen render size — the Stage itself is scaled to fit, and Konva
 * automatically un-scales drag/transform coordinates back to design space.
 * This keeps the persisted `layout` percentages resolution-independent, same
 * as the old div-based canvas.
 */
export const STAGE_UNIT = 1000;

export function stageSize(orientation: 'portrait' | 'landscape') {
    return orientation === 'portrait'
        ? { width: STAGE_UNIT, height: Math.round(STAGE_UNIT * Math.SQRT2) }
        : { width: Math.round(STAGE_UNIT * Math.SQRT2), height: STAGE_UNIT };
}

export function pctToPx(pct: number, size: number): number {
    return (pct / 100) * size;
}

export function pxToPct(px: number, size: number): number {
    return Math.round(Math.min(100, Math.max(0, (px / size) * 100)) * 10) / 10;
}

export interface Rect {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export function elementRect(
    el: TemplateElement,
    stageWidth: number,
    stageHeight: number,
): Rect {
    return {
        id: el.id,
        x: pctToPx(el.x, stageWidth),
        y: pctToPx(el.y, stageHeight),
        width: pctToPx(el.width, stageWidth),
        height: pctToPx(el.height ?? 8, stageHeight),
    };
}

export interface Guide {
    points: [number, number, number, number];
}

const SNAP_THRESHOLD = 6;

/**
 * Compares the dragged rect's edges/center against the stage center and
 * every other element's edges/center; snaps within SNAP_THRESHOLD design-
 * space pixels and returns guide lines to draw while dragging.
 */
export function computeSnap(
    dragged: Rect,
    others: Rect[],
    stageWidth: number,
    stageHeight: number,
): { x: number; y: number; guides: Guide[] } {
    const guides: Guide[] = [];
    let snapX = dragged.x;
    let snapY = dragged.y;

    const targetsX = [0, stageWidth / 2, stageWidth];
    const targetsY = [0, stageHeight / 2, stageHeight];
    others.forEach((o) => {
        targetsX.push(o.x, o.x + o.width / 2, o.x + o.width);
        targetsY.push(o.y, o.y + o.height / 2, o.y + o.height);
    });

    const draggedEdgesX = [dragged.x, dragged.x + dragged.width / 2, dragged.x + dragged.width];
    const draggedEdgesY = [dragged.y, dragged.y + dragged.height / 2, dragged.y + dragged.height];

    for (const edge of draggedEdgesX) {
        for (const target of targetsX) {
            if (Math.abs(edge - target) < SNAP_THRESHOLD) {
                const delta = target - edge;
                snapX = dragged.x + delta;
                guides.push({ points: [target, 0, target, stageHeight] });
                break;
            }
        }
    }
    for (const edge of draggedEdgesY) {
        for (const target of targetsY) {
            if (Math.abs(edge - target) < SNAP_THRESHOLD) {
                const delta = target - edge;
                snapY = dragged.y + delta;
                guides.push({ points: [0, target, stageWidth, target] });
                break;
            }
        }
    }

    return { x: snapX, y: snapY, guides };
}

/** Reorders `elements` by moving the item at `id` — used by layering controls. */
export function reorder(
    elements: TemplateElement[],
    id: string,
    to: 'front' | 'back' | 'forward' | 'backward',
): TemplateElement[] {
    const index = elements.findIndex((e) => e.id === id);
    if (index === -1) return elements;
    const next = [...elements];
    const [item] = next.splice(index, 1);
    if (to === 'front') next.push(item);
    else if (to === 'back') next.unshift(item);
    else if (to === 'forward') next.splice(Math.min(index + 1, next.length), 0, item);
    else next.splice(Math.max(index - 1, 0), 0, item);
    return next;
}
