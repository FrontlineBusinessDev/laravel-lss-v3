/**
 * @file hooks/use-scroll-lock.ts
 * Locks <body> scroll while a modal is open, restoring the previous value on
 * unmount. No-op when `locked` is false.
 */

import { useEffect } from 'react';

export function useScrollLock(locked: boolean): void {
    useEffect(() => {
        if (!locked) {
            return;
        }

        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = original;
        };
    }, [locked]);
}
