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
}: ThumbnailProps) {
    const [errored, setErrored] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    if (!src || errored) {
        return (
            <>{fallback ?? <span className="text-sm text-slate-400">—</span>}</>
        );
    }

    // if (isLoading) {
    //     return <div>12312</div>;
    // }

    return (
        <>
            {isError ? (
                <>
                    <div>
                        <File className="size-5" />
                    </div>
                </>
            ) : (
                <>
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setErrored(true)}
                        className={className}
                        onLoad={() => {
                            setIsLoading(false);
                        }}
                        onErrorCapture={() => {
                            setIsError(true);
                            setIsLoading(false);
                        }}
                    />
                </>
            )}
        </>
    );
}
