import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { TextAreaField } from '@/components/FormField';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { router } from '@inertiajs/react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';

export function ApprovalSection({ trainee }: { trainee: TraineeDetail }) {
    const { toast } = useToast();
    const [busy, setBusy] = useState(false);
    const [batchId, setBatchId] = useState(String(trainee.batch_id));
    const [batchLabel, setBatchLabel] = useState(
        trainee.batch?.batch_code ?? '',
    );
    const [declineOpen, setDeclineOpen] = useState(false);
    const [remarks, setRemarks] = useState('');

    const approve = async () => {
        setBusy(true);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/approve`, {
                method: 'POST',
                body: JSON.stringify({ batch_id: Number(batchId) }),
            });
            toast({
                title: 'Trainee approved',
                description: 'Their account was created and an activation email was sent.',
                variant: 'success',
            });
            router.reload({ only: ['trainee'] });
        } catch (error) {
            toast({
                title: 'Approval failed',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setBusy(false);
        }
    };

    const decline = async () => {
        setBusy(true);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/decline`, {
                method: 'POST',
                body: JSON.stringify({ remarks: remarks || null }),
            });
            toast({
                title: 'Application declined',
                variant: 'success',
            });
            setDeclineOpen(false);
            router.reload({ only: ['trainee'] });
        } catch (error) {
            toast({
                title: 'Decline failed',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="mt-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-5"
            data-cy="personal-info-tab-approval-section"
        >
            <div>
                <div className="text-xs font-medium text-amber-700">
                    Pending approval
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                    This application has no login account yet. Confirm the
                    batch and approve to activate the trainee, or decline the
                    application.
                </p>
            </div>
            {!declineOpen ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="w-full sm:max-w-xs">
                        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                            Batch
                        </label>
                        <AsyncSelectField
                            value={batchId}
                            initialLabel={batchLabel}
                            placeholder="Select batch"
                            loadOptions={(q) =>
                                loadLookupOptions('/batches', q, 'batch_code')
                            }
                            onChange={(v) => {
                                setBatchId((v as string) ?? '');
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            icon={ShieldCheck}
                            disabled={busy || !batchId}
                            onClick={() => void approve()}
                            data-cy="personal-info-tab-button-approve"
                        >
                            Approve
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            icon={ShieldX}
                            disabled={busy}
                            onClick={() => setDeclineOpen(true)}
                            data-cy="personal-info-tab-button-decline"
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <TextAreaField
                        label="Decline remarks (optional)"
                        rows={2}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={busy}
                            onClick={() => setDeclineOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={busy}
                            onClick={() => void decline()}
                            data-cy="personal-info-tab-button-confirm-decline"
                        >
                            {busy ? 'Declining…' : 'Confirm decline'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
