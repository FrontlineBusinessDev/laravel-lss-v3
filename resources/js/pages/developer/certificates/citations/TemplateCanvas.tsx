import { useEffect, useRef, useState } from 'react';
import { Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { TemplateElement } from '../types';
import {
    computeSnap,
    elementRect,
    pctToPx,
    pxToPct,
    stageSize,
    type Guide,
} from './templateStage';
import { useHtmlImage } from './useHtmlImage';

interface TemplateCanvasProps {
    elements: TemplateElement[];
    selectedId: string | null;
    orientation: 'portrait' | 'landscape';
    onSelect: (id: string | null) => void;
    onMove: (id: string, x: number, y: number) => void;
    onTransform: (id: string, patch: Partial<TemplateElement>) => void;
}

const SAMPLE_TEXT: Record<string, string> = {
    recipientName: 'Juan Dela Cruz',
    subtitle: 'Sample School',
    citationText: 'This is to certify that Juan Dela Cruz has completed the program.',
    certificateNo: 'Certificate No. PREVIEW-0000',
    issuedDate: 'Issued July 17, 2026',
};

function elementText(el: TemplateElement): string {
    if (el.type !== 'text') return '';
    return el.token ? (SAMPLE_TEXT[el.token] ?? el.token) : el.text || 'Text';
}

function ElementNode({
    el,
    stageWidth,
    stageHeight,
    isSelected,
    shapeRef,
    onSelect,
    onDragMove,
    onDragEnd,
    onTransformEnd,
}: {
    el: TemplateElement;
    stageWidth: number;
    stageHeight: number;
    isSelected: boolean;
    shapeRef: (node: Konva.Node | null) => void;
    onSelect: () => void;
    onDragMove: (e: KonvaEventObject<DragEvent>) => void;
    onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
    onTransformEnd: (e: KonvaEventObject<Event>) => void;
}) {
    const rect = elementRect(el, stageWidth, stageHeight);
    const image = useHtmlImage(el.type === 'image' ? el.src : undefined);
    const common = {
        id: el.id,
        x: rect.x,
        y: rect.y,
        rotation: el.rotation ?? 0,
        draggable: true,
        onClick: onSelect,
        onTap: onSelect,
        onDragMove,
        onDragEnd,
        onTransformEnd,
        ref: shapeRef,
    };

    if (el.type === 'line') {
        return (
            <Line
                {...common}
                points={[0, 0, rect.width, 0]}
                stroke={el.color || '#1f2937'}
                strokeWidth={2}
                hitStrokeWidth={16}
            />
        );
    }

    if (el.type === 'image') {
        if (image) {
            return <KonvaImage {...common} image={image} width={rect.width} height={rect.height} />;
        }
        return (
            <Rect
                {...common}
                width={rect.width}
                height={rect.height}
                fill={isSelected ? '#eff6ff' : '#fafafa'}
                stroke="#d4d4d4"
                dash={[6, 4]}
            />
        );
    }

    if (el.type === 'qr') {
        return (
            <Rect
                {...common}
                width={rect.width}
                height={rect.height}
                fill={isSelected ? '#eff6ff' : '#fafafa'}
                stroke="#d4d4d4"
                dash={[6, 4]}
            />
        );
    }

    return (
        <Text
            {...common}
            width={rect.width}
            height={rect.height}
            text={elementText(el)}
            fontSize={el.fontSize ?? 14}
            fontStyle={el.fontWeight === 'bold' ? 'bold' : 'normal'}
            align={el.align ?? 'left'}
            fill={el.color || '#171717'}
            wrap="word"
        />
    );
}

/** Konva-based drag/resize/rotate canvas — replaces the old div/pointer-events implementation. */
export function TemplateCanvas({
    elements,
    selectedId,
    orientation,
    onSelect,
    onMove,
    onTransform,
}: TemplateCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const shapeRefs = useRef<Map<string, Konva.Node>>(new Map());
    const [containerWidth, setContainerWidth] = useState(672);
    const [guides, setGuides] = useState<Guide[]>([]);

    const { width: stageWidth, height: stageHeight } = stageSize(orientation);
    const scale = containerWidth / stageWidth;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width;
            if (width) setContainerWidth(width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const transformer = transformerRef.current;
        if (!transformer) return;
        const node = selectedId ? shapeRefs.current.get(selectedId) : null;
        transformer.nodes(node ? [node] : []);
        transformer.getLayer()?.batchDraw();
    }, [selectedId, elements]);

    function otherRects(excludeId: string) {
        return elements
            .filter((e) => e.id !== excludeId)
            .map((e) => elementRect(e, stageWidth, stageHeight));
    }

    function handleDragMove(id: string, e: KonvaEventObject<DragEvent>) {
        const node = e.target;
        const el = elements.find((x) => x.id === id);
        if (!el) return;
        const rect = { id, x: node.x(), y: node.y(), width: pctToPx(el.width, stageWidth), height: pctToPx(el.height ?? 8, stageHeight) };
        const snap = computeSnap(rect, otherRects(id), stageWidth, stageHeight);
        node.position({ x: snap.x, y: snap.y });
        setGuides(snap.guides);
    }

    function handleDragEnd(id: string, e: KonvaEventObject<DragEvent>) {
        setGuides([]);
        const node = e.target;
        onMove(id, pxToPct(node.x(), stageWidth), pxToPct(node.y(), stageHeight));
    }

    function handleTransformEnd(id: string, e: KonvaEventObject<Event>) {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const width = Math.max(10, node.width() * scaleX);
        const height = Math.max(10, node.height() * scaleY);
        node.scaleX(1);
        node.scaleY(1);
        onTransform(id, {
            x: pxToPct(node.x(), stageWidth),
            y: pxToPct(node.y(), stageHeight),
            width: pxToPct(width, stageWidth),
            height: pxToPct(height, stageHeight),
            rotation: Math.round(node.rotation()),
        });
    }

    return (
        <div ref={containerRef} className="w-full max-w-2xl" data-cy="template-canvas-div">
            <Stage
                ref={stageRef}
                width={stageWidth * scale}
                height={stageHeight * scale}
                scaleX={scale}
                scaleY={scale}
                className="border-[3px] border-brand-700 bg-white shadow-card"
                onMouseDown={(e) => {
                    if (e.target === e.target.getStage()) onSelect(null);
                }}
            >
                <Layer>
                    {elements.map((el) => (
                        <ElementNode
                            key={el.id}
                            el={el}
                            stageWidth={stageWidth}
                            stageHeight={stageHeight}
                            isSelected={selectedId === el.id}
                            shapeRef={(node) => {
                                if (node) shapeRefs.current.set(el.id, node);
                                else shapeRefs.current.delete(el.id);
                            }}
                            onSelect={() => onSelect(el.id)}
                            onDragMove={(e) => handleDragMove(el.id, e)}
                            onDragEnd={(e) => handleDragEnd(el.id, e)}
                            onTransformEnd={(e) => handleTransformEnd(el.id, e)}
                        />
                    ))}
                    {guides.map((g, i) => (
                        <Line key={i} points={g.points} stroke="#3b82f6" strokeWidth={1} dash={[4, 4]} listening={false} />
                    ))}
                    <Transformer ref={transformerRef} rotateEnabled boundBoxFunc={(oldBox, newBox) => (newBox.width < 10 || newBox.height < 10 ? oldBox : newBox)} />
                </Layer>
            </Stage>
        </div>
    );
}
