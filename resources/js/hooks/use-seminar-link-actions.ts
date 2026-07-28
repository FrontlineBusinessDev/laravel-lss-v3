import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { copyText } from '@/lib/clipboard';
import { AppSeminar } from '@/types/modules/seminar/seminar';

/**
 * Batch public-registration link actions for the list: an optimistic
 * enable/disable toggle and a production-safe copy. Keeps a per-row override
 * (keyed by batch id) so toggling feels instant without a full list refetch;
 * the override reverts if the request fails.
 */
export function useSeminarLinkActions() {
    const { showToast } = useToast();
    const [override, setOverride] = useState<Record<number, boolean>>({});

    const isEnabled = (row: AppSeminar) =>
        override[Number(row.id)] ?? !!row.is_public_url_enable;

    const toggle = async (row: AppSeminar) => {
        const next = !isEnabled(row);
        setOverride((m) => ({ ...m, [row.id]: next }));

        try {
            await apiFetchJson(
                `/seminars/list-of-seminars/${row.id}/toggle-registration`,
                {
                    method: 'PATCH',
                },
            );
            showToast(
                next ? 'Public link enabled' : 'Public link disabled',
                'success',
            );
        } catch (err) {
            setOverride((m) => ({ ...m, [row.id]: !next }));
            showToast(
                err instanceof Error ? err.message : 'Please try again.',
                'error',
            );
        }
    };

    const copy = async (row: AppSeminar) => {
        const url = `${window.location.origin}/register/${row.public_registration_url_id}`;
        const ok = await copyText(url);
        showToast(
            ok ? 'Registration link copied' : 'Please copy the link manually.',
            ok ? 'success' : 'error',
        );
    };

    return { isEnabled, toggle, copy };
}
