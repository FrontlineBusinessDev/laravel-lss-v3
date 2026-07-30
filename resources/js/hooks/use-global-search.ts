/**
 * @file hooks/use-global-search.ts
 * Data layer for the global "powerful search" command palette
 * (Ctrl+K / Cmd+K). Owns the raw query, its debounced counterpart (via the
 * existing generic `useDebouncedValue`), and the `GET /search` fetch —
 * nothing about the overlay UI itself, so it can be reused by any trigger.
 *
 * The single `/search` endpoint (`App\Http\Controllers\v1\GlobalSearchController`)
 * branches on the authenticated user's role server-side and returns only
 * the entities/records that role may see, already grouped and with a
 * role-correct redirect `url` per result.
 *
 * To add a new searchable entity: add a `group()` call inside the relevant
 * `GlobalSearchController::searchAs*()` method server-side. No frontend
 * change is needed — results appear automatically, grouped under the new
 * `key`/`label`.
 */

import { apiFetchJson } from '@/lib/apiFetch';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/components/table/hooks';
import type { GlobalSearchGroup } from '@/types/modules/search/global-search';

const MIN_QUERY_LENGTH = 2;

export function useGlobalSearch() {
    const [query, setQuery] = useState('');
    const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebouncedValue(query, 350);

    useEffect(() => {
        const term = debouncedQuery.trim();

        if (term.length < MIN_QUERY_LENGTH) {
            setGroups([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        apiFetchJson<{ groups: GlobalSearchGroup[] }>(
            `/search?q=${encodeURIComponent(term)}`,
        )
            .then((res) => {
                if (!cancelled) setGroups(res.data?.groups ?? []);
            })
            .catch(() => {
                if (!cancelled) setGroups([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const reset = () => {
        setQuery('');
        setGroups([]);
        setLoading(false);
    };

    return {
        query,
        setQuery,
        groups,
        loading,
        hasQuery: debouncedQuery.trim().length >= MIN_QUERY_LENGTH,
        reset,
    };
}
