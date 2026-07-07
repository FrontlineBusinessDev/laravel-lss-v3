/**
 * @file hooks/useAsyncAction.ts
 *
 * Wraps an async function with a loading state.
 * Prevents double-firing by disabling while the action is in flight.
 *
 * @example
 *   const { run: archive, loading: archiving } = useAsyncAction(handleArchive);
 *
 *   <button disabled={archiving} onClick={() => archive(row)}>
 *       {archiving ? <Spinner /> : 'Archive'}
 *   </button>
 */

import { useState } from 'react';

export function useAsyncAction<TArgs extends unknown[]>(
    fn: (...args: TArgs) => Promise<unknown>,
) {
    const [loading, setLoading] = useState(false);

    const run = async (...args: TArgs) => {
        if (loading) {
return;
} // prevent double-fire

        setLoading(true);

        try {
            await fn(...args);
        } finally {
            setLoading(false);
        }
    };

    return { run, loading };
}
