import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SkeletonLoader } from './spinners/SkeletonLoader';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    src?: string | null;
    name: string;
    initials?: string;
    size?: AvatarSize;
    className?: string;
    isLoading?: boolean;
    'data-cy'?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
};

function deriveInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '—'
    );
}

/** Reusable avatar: renders the image when `src` is set, otherwise initials on a colored circle. */
export function Avatar({
    src,
    name,
    initials,
    size = 'md',
    className,
    isLoading = false,
    'data-cy': dataCy = 'avatar',
}: AvatarProps) {
    const sizeClass = SIZE_CLASSES[size];
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        setImgLoaded(false);
    }, [src]);

    if (src) {
        const showShimmer = !imgLoaded || isLoading;
        return (
            <div className={cn('relative shrink-0', sizeClass)}>
                {showShimmer && (
                    <SkeletonLoader
                        variant="circle"
                        className={cn('absolute inset-0 z-10', sizeClass)}
                    />
                )}
                <img
                    src={src}
                    alt={name}
                    className={cn(
                        'h-full w-full rounded-full object-cover',
                        className,
                    )}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgLoaded(true)}
                    data-cy={`${dataCy}-img`}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700',
                sizeClass,
                className,
            )}
            data-cy={`${dataCy}-initials`}
        >
            {initials || deriveInitials(name)}
        </div>
    );
}
