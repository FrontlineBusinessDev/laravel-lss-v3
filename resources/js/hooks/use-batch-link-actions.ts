import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { copyText } from '@/lib/clipboard';
import type { AppBatches } from '@/types/modules/batches/batches';

/**
 * Batch public-registration link actions for the list: an optimistic
 * enable/disable toggle and a production-safe copy. Keeps a per-row override
 * (keyed by batch id) so toggling feels instant without a full list refetch;
 * the override reverts if the request fails.
 */
export function useBatchLinkActions() {
    const { toast } = useToast();
    const [override, setOverride] = useState<Record<number, boolean>>({});

    const isEnabled = (row: AppBatches) =>
        override[row.id] ?? !!row.is_public_url_enable;

    const toggle = async (row: AppBatches) => {
        const next = !isEnabled(row);
        setOverride((m) => ({ ...m, [row.id]: next }));

        try {
            await apiFetchJson(`/batches/${row.id}/toggle-registration`, {
                method: 'PATCH',
            });
            toast({
                title: next ? 'Public link enabled' : 'Public link disabled',
                variant: 'success',
            });
        } catch (err) {
            setOverride((m) => ({ ...m, [row.id]: !next }));
            toast({
                title: 'Update failed',
                description:
                    err instanceof Error ? err.message : 'Please try again.',
                variant: 'error',
            });
        }
    };

    const copy = async (row: AppBatches) => {
        const url = `${window.location.origin}/register/${row.public_registration_url_id}`;
        const ok = await copyText(url);
        toast(
            ok
                ? { title: 'Registration link copied', variant: 'success' }
                : {
                      title: 'Could not copy',
                      description: 'Please copy the link manually.',
                      variant: 'error',
                  },
        );
    };

    return { isEnabled, toggle, copy };
}
