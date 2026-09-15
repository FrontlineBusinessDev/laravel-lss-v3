import { File } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
interface ThumbnailProps {
    /** Image URL. When empty/null the fallback is rendered. */
    src?: string | null;
    alt?: string;
    className?: string;
    /** Rendered when there is no `src` or the image fails to load. */
    fallback?: ReactNode;
    /** data-cy applied to whichever branch actually renders (img, error icon, or empty fallback). */
    'data-cy'?: string;
}

/**
 * Image thumbnail with a graceful fallback. Unlike a bare `<img>`, this guards
 * against BOTH a missing URL and a broken/404 URL (via `onError`), so a dead
 * link never shows the browser's broken-image glyph. Defaults to an em-dash
 * placeholder, matching the settings list convention.
 */
export function Thumbnail({
    src,
    alt = '',
    className,
    fallback,
    'data-cy': dataCy,
}: ThumbnailProps) {
    const [errored, setErrored] = useState(false);
    const [isError, setIsError] = useState(false);
    if (!src || errored) {
        return (
            <>
                {fallback ?? (
                    <span
                        className="text-sm text-slate-400"
                        data-cy={dataCy ?? 'thumbnail-span-1'}
                    >
                        —
                    </span>
                )}
            </>
        );
    }

    return (
        <>
            {isError ? (
                <>
                    <div data-cy={dataCy ?? 'thumbnail-div-2'}>
                        <File className="size-5" data-cy="thumbnail-file-3" />
                    </div>
                </>
            ) : (
                <>
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setErrored(true)}
                        className={className}
                        onErrorCapture={() => {
                            setIsError(true);
                        }}
                        data-cy={dataCy ?? 'thumbnail-img-4'}
                    />
                </>
            )}
        </>
    );
}
