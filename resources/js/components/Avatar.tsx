import { cn } from '@/lib/utils';
import { useState } from 'react';
import BarLoading from './spinners/BarLoading';

export type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    src?: string | null;
    name: string;
    initials?: string;
    size?: AvatarSize;
    className?: string;
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
    'data-cy': dataCy = 'avatar',
}: AvatarProps) {
    const sizeClass = SIZE_CLASSES[size];
    const [isLoading, setIsLoading] = useState(true);

    if (src) {
        return (
            <div className="relative">
                <div className="absolute z-10 h-full w-full rounded-full">
                    <BarLoading />
                </div>
                {/* {isLoading && <BarLoading/> } */}
                <img
                    src={src}
                    alt={name}
                    className={cn(
                        'shrink-0 rounded-full object-cover',
                        sizeClass,
                        className,
                    )}
                    loading="lazy"
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
