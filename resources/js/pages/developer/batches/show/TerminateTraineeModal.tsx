import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import type { TraineeRow } from '@/types/modules/batches/trainees';

interface Props {
    open: boolean;
    onClose: () => void;
    trainee: TraineeRow | null;
    onTerminated: () => void;
}

/** Marks a trainee as terminated, with an optional remarks note. */
export function TerminateTraineeModal({
    open,
    onClose,
    trainee,
    onTerminated,
}: Props) {
    const { showToast } = useToast();
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open || !trainee) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/terminate`, {
                method: 'POST',
                body: JSON.stringify({ termination_remarks: remarks || undefined }),
            });
            showToast('Trainee terminated', 'success');
            setRemarks('');
            onTerminated();
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to terminate trainee.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Terminate trainee"
            description={`This marks ${trainee.first_name} ${trainee.last_name} as terminated. They will stay visible in the batch list but move to the bottom.`}
            data-cy="terminate-trainee-modal"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-cy="terminate-trainee-modal-form"
            >
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-700">
                        Remarks (optional)
                    </label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                        placeholder="Reason for termination..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                </div>

                {error && <p className="text-xs text-danger-600">{error}</p>}

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
                        className="inline-flex items-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-600/90 disabled:opacity-60"
                    >
                        {submitting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Terminate
                    </button>
                </div>
            </form>
        </Modal>
    );
}
