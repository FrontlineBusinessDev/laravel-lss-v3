import { RecordModal } from '@/components/table/components/RecordModal';
import { isFieldVisible } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import type { AppBatches } from '@/types/modules/batches/batches';
import { fields } from '@/types/modules/batches/batches';

/**
 * Unified Create/Edit batch modal. Passing `batch` switches it into edit mode
 * (PUT /batches/{id}); omitting it creates (POST /batches). Both paths render
 * the same shared `fields` through the app's RecordModal engine — the exact
 * modal the /batches list uses — so there is a single source of truth for the
 * batch form. Replaces the former CreateBatchModal + EditBatchModal pair.
 */
export function CreateBatchModal({
    open,
    onClose,
    batch,
    onSaved,
}: {
    open: boolean;
    onClose: () => void;
    batch?: AppBatches;
    onSaved?: (saved: AppBatches) => void;
}) {
    const { toast } = useToast();

    if (!open) {
        return null;
    }

    const mode = batch ? 'edit' : 'create';

    const handleSubmit = async (values: Record<string, unknown>) => {
        // Mirror DataTableField's payload build: read each visible field by
        // `key`, submit under `payloadKey` when the API name differs, and apply
        // any `transform`. Batch fields map 1:1, but this keeps it future-proof.
        const payload: Record<string, unknown> = {};
        fields
            .filter((f) => isFieldVisible(f, mode, batch))
            .forEach((f) => {
                const raw = values[f.key as string];
                const outKey = f.payloadKey ?? (f.key as string);
                payload[outKey] = f.transform ? f.transform(raw) : raw;
            });

        const url = batch ? `/batches/${batch.id}` : '/batches';
        const response = await apiFetchJson<AppBatches>(url, {
            method: batch ? 'PUT' : 'POST',
            body: JSON.stringify(payload),
        });

        toast({
            title: batch ? 'Batch updated' : 'Batch created',
            variant: 'success',
        });
        onSaved?.(response.data);
        onClose();
    };

    return (
        <RecordModal<AppBatches>
            mode={mode}
            row={batch}
            fields={fields}
            title={batch ? 'Edit batch' : 'Add batch'}
            onClose={onClose}
            onSubmit={handleSubmit}
        />
    );
}
