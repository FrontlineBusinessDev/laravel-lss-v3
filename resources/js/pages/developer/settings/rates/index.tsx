import { ratesService } from '@/api-service-layer/admin/rates';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { TextField } from '@/components/FormField';
import { useToast } from '@/hooks/use-toast';
import type { Rate } from '@/types/modules/settings/academic/rates';
import { router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';

interface Props {
    rates: Rate;
}

export default function DefaultRatesPage({ rates }: Props) {
    const { toast } = useToast();
    const [draft, setDraft] = useState<Rate>(rates);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await ratesService.update(draft);
            toast({ title: 'Default rates updated', variant: 'success' });
            router.reload({ only: ['rates'] });
        } catch (error) {
            toast({
                title: 'Failed to update rates',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="max-w-md rounded-2xl border border-[#ecedf1] bg-white p-5 shadow-sm"
            data-cy="rates-index-div-form"
        >
            <h2 className="mb-1 text-sm font-semibold text-ink">
                Default hourly rates
            </h2>
            <p className="mb-4 text-xs text-neutral-500">
                Base rate per training hour, inherited by trainees from their
                batch's setup (Face-to-Face or Online).
            </p>
            <TextField
                label="Face-to-Face rate (per hour)"
                type="number"
                min={0}
                step="0.01"
                value={draft.f2f}
                onChange={(e) =>
                    setDraft((d) => ({ ...d, f2f: e.target.value }))
                }
                data-cy="rates-index-text-field-f2f"
            />
            <TextField
                label="Online rate (per hour)"
                type="number"
                min={0}
                step="0.01"
                value={draft.online}
                onChange={(e) =>
                    setDraft((d) => ({ ...d, online: e.target.value }))
                }
                data-cy="rates-index-text-field-online"
            />
            <Button
                variant="primary"
                icon={Save}
                onClick={save}
                disabled={saving}
                data-cy="rates-index-button-save"
            >
                {saving ? 'Saving…' : 'Save changes'}
            </Button>
        </div>
    );
}
