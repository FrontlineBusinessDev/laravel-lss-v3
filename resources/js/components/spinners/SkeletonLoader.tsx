/**
 * @file components/SkeletonLoader.tsx
 * Reusable skeleton loader component with animations, mobile responsiveness, and accessibility.
 */

import React from 'react';

interface SkeletonLoaderProps {
    count?: number;
    height?: string;
    className?: string;
    animated?: boolean;
    variant?: 'line' | 'card' | 'circle';
}

/**
 * Generic skeleton loader with multiple animation variants.
 * Supports pulse, shimmer, and wave animations.
 *
 * @example
 *   <SkeletonLoader count={5} variant="card" />
 */
export function SkeletonLoader({
    count = 1,
    height = '40px',
    className = '',
    animated = true,
    variant = 'line',
}: SkeletonLoaderProps) {
    const animationClass = animated ? 'animate-shimmer' : 'animate-pulse';

    // `circle` intentionally carries no default size: callers must size it via
    // `className` (e.g. `h-10 w-10`). Baking in a default here would fight
    // caller-supplied width/height classes, since Tailwind's cascade order
    // (not JSX order) decides which utility wins when both set the same property.
    const variantClasses = {
        line: 'rounded-lg h-full',
        card: 'rounded-xl h-full',
        circle: 'rounded-full mx-auto',
    };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`${animationClass} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${variantClasses[variant]} ${className}`}
                    style={{
                        height: variant === 'circle' ? undefined : height,
                        backgroundSize: '200% 100%',
                    }}
                    aria-busy="true"
                    aria-label="Loading..."
                    role="status"
                />
            ))}
        </>
    );
}

/**
 * Card skeleton loader - great for grid/card layouts.
 */
export function SkeletonCard({
    count = 1,
    showImage = true,
    showTitle = true,
    showDescription = true,
}: {
    count?: number;
    showImage?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                    {/* Image skeleton */}
                    {showImage && (
                        <SkeletonLoader
                            height="200px"
                            className="mb-3 w-full rounded-lg"
                        />
                    )}

                    {/* Title skeleton */}
                    {showTitle && (
                        <>
                            <SkeletonLoader
                                height="16px"
                                className="mb-2 w-3/4"
                            />
                            <SkeletonLoader
                                height="14px"
                                className="mb-4 w-1/2"
                            />
                        </>
                    )}

                    {/* Description skeleton */}
                    {showDescription && (
                        <>
                            <SkeletonLoader
                                height="12px"
                                className="mb-2 w-full"
                            />
                            <SkeletonLoader
                                height="12px"
                                className="mb-4 w-5/6"
                            />
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Table row skeleton loader with mobile responsiveness.
 */
export function SkeletonTableRow({
    columns = 5,
    isMobile = false,
}: {
    columns?: number;
    isMobile?: boolean;
}) {
    // On mobile, show fewer columns and stack them
    const displayColumns = isMobile ? Math.min(columns, 2) : columns;

    return (
        <div
            className={`grid gap-2 border-b border-gray-200 p-3 sm:gap-3 sm:p-4 dark:border-gray-700 ${
                isMobile ? 'grid-cols-1' : ''
            }`}
            style={{
                gridTemplateColumns: !isMobile
                    ? Array(displayColumns).fill('1fr').join(' ')
                    : undefined,
            }}
        >
            {Array.from({ length: displayColumns }).map((_, i) => (
                <div key={i} className="space-y-1">
                    <SkeletonLoader height="20px" />
                    {isMobile && (
                        <SkeletonLoader height="12px" className="w-3/4" />
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Table skeleton loader with responsive design.
 * Automatically adjusts columns based on screen size.
 *
 * @example
 *   <SkeletonTable rows={5} columns={5} />
 */
export function SkeletonTable({
    rows = 5,
    columns = 5,
    showHeader = true,
}: {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // On mobile, show fewer columns
    const displayColumns = isMobile ? 2 : columns;

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-full overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                {/* Header */}
                {showHeader && (
                    <div
                        className="hidden gap-3 border-b border-gray-200 bg-gray-50 p-4 text-sm font-semibold sm:grid dark:border-gray-600 dark:bg-gray-700"
                        style={{
                            gridTemplateColumns: Array(displayColumns)
                                .fill('1fr')
                                .join(' '),
                        }}
                    >
                        {Array.from({ length: displayColumns }).map((_, i) => (
                            <SkeletonLoader key={i} height="16px" />
                        ))}
                    </div>
                )}

                {/* Rows */}
                <div>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow
                            key={i}
                            columns={columns}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * List skeleton loader - for feed/list layouts.
 */
export function SkeletonList({
    items = 5,
    withAvatar = true,
}: {
    items?: number;
    withAvatar?: boolean;
}) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div
                    key={i}
                    className="flex gap-3 rounded-lg bg-white p-3 sm:gap-4 sm:p-4 dark:bg-gray-800"
                >
                    {/* Avatar skeleton */}
                    {withAvatar && (
                        <SkeletonLoader
                            height="40px"
                            className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12"
                            variant="circle"
                        />
                    )}

                    {/* Content skeleton */}
                    <div className="min-w-0 flex-1">
                        <SkeletonLoader height="16px" className="mb-2 w-2/3" />
                        <SkeletonLoader height="12px" className="mb-2 w-full" />
                        <SkeletonLoader height="12px" className="w-4/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}
