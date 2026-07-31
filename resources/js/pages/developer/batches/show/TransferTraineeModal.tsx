import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { TraineeRow } from '@/types/modules/batches/trainees';

interface Props {
    open: boolean;
    onClose: () => void;
    trainee: TraineeRow | null;
    currentBatchId: number;
    onTransferred: () => void;
}

/** Moves a trainee out of the current batch into a different target batch. */
export function TransferTraineeModal({
    open,
    onClose,
    trainee,
    currentBatchId,
    onTransferred,
}: Props) {
    const { showToast } = useToast();
    const [targetBatchId, setTargetBatchId] = useState<string | number>('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open || !trainee) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!targetBatchId) {
            setError('Select a target batch.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/transfer`, {
                method: 'POST',
                body: JSON.stringify({ batch_id: targetBatchId }),
            });
            showToast('Trainee transferred', 'success');
            setTargetBatchId('');
            onTransferred();
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to transfer trainee.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Transfer trainee"
            description={`Move ${trainee.first_name} ${trainee.last_name} to a different batch.`}
            data-cy="transfer-trainee-modal"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-cy="transfer-trainee-modal-form"
            >
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                        Target batch
                    </label>
                    <AsyncSelectField
                        value={targetBatchId}
                        onChange={(v) => setTargetBatchId(v as string)}
                        loadOptions={(q) =>
                            loadLookupOptions('/batches', q, 'batch_code').then(
                                (opts) =>
                                    opts.filter(
                                        (o) =>
                                            String(o.value) !==
                                            String(currentBatchId),
                                    ),
                            )
                        }
                        placeholder="Select batch"
                        error={error ?? undefined}
                    />
                    {error && (
                        <p className="mt-1 text-xs text-danger-600">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                    >
                        {submitting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Transfer
                    </button>
                </div>
            </form>
        </Modal>
    );
}
