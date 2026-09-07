/**
 * @file components/SkeletonLoader.tsx
 * Reusable skeleton loader component with animations, mobile responsiveness, and accessibility.
 */

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
  variant = 'line'
}: SkeletonLoaderProps) {
  const animationClass = animated ? 'animate-shimmer' : 'animate-pulse';

  // `circle` intentionally carries no default size: callers must size it via
  // `className` (e.g. `h-10 w-10`). Baking in a default here would fight
  // caller-supplied width/height classes, since Tailwind's cascade order
  // (not JSX order) decides which utility wins when both set the same property.
  const variantClasses = {
    line: 'rounded-lg h-full',
    card: 'rounded-xl h-full',
    circle: 'rounded-full mx-auto'
  };
  return <>
            {Array.from({
      length: count
    }).map((_, i) => <div key={i} className={`${animationClass} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${variantClasses[variant]} ${className}`} style={{
      height: variant === 'circle' ? undefined : height,
      backgroundSize: '200% 100%'
    }} aria-busy="true" aria-label="Loading..." role="status" data-cy="skeleton-loader-div-loading" />)}
        </>;
}
