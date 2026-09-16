import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { errorInputCls, Field, textareaCls } from '@/components/form/Field';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { router } from '@inertiajs/react';
import { Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

type ApproveValues = { batch_id: string };
type DeclineValues = { remarks: string };

// Mirrors TraineesController::approve(): batch_id required + exists (lookup
// existence enforced server-side, client only checks presence).
const approveSchema = z.object({
    batch_id: z.string().min(1, 'Batch is required.'),
}) satisfies z.ZodType<ApproveValues>;

// Mirrors TraineesController::decline(): remarks nullable string <= 1000.
const declineSchema = z.object({
    remarks: z.string().max(1000, 'Remarks must be 1000 characters or fewer.'),
}) satisfies z.ZodType<DeclineValues>;

export function ApprovalSection({ trainee }: { trainee: TraineeDetail }) {
    const { showToast } = useToast();
    const [batchLabel] = useState(trainee.batch?.batch_code ?? '');
    const [declineOpen, setDeclineOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        control: approveControl,
        handleSubmit: handleApproveSubmit,
        setError: setApproveError,
        formState: { errors: approveErrors, isSubmitting: approving },
    } = useForm<ApproveValues>({
        resolver: zodResolver(approveSchema),
        defaultValues: { batch_id: String(trainee.batch_id) },
    });
    const {
        register: registerDecline,
        reset: resetDecline,
        handleSubmit: handleDeclineSubmit,
        formState: { errors: declineErrors, isSubmitting: declining },
    } = useForm<DeclineValues>({
        resolver: zodResolver(declineSchema),
        defaultValues: { remarks: '' },
    });

    const onApprove = async ({ batch_id }: ApproveValues) => {
        setFormError(null);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/approve`, {
                method: 'POST',
                body: JSON.stringify({ batch_id: Number(batch_id) }),
            });
            showToast(
                'Their account was created and an activation email was sent.',
                'success',
            );
            router.reload({ only: ['trainee'] });
        } catch (error) {
            if (error instanceof ApiError && error.errors?.batch_id) {
                setApproveError('batch_id', {
                    message: error.errors.batch_id[0],
                });
            }
            setFormError(
                error instanceof ApiError ? error.message : 'Approval failed',
            );
        }
    };

    const onDecline = async ({ remarks }: DeclineValues) => {
        setFormError(null);
        try {
            await apiFetchJson(`/trainees/${trainee.id}/decline`, {
                method: 'POST',
                body: JSON.stringify({ remarks: remarks || null }),
            });
            showToast('Application declined', 'success');
            setDeclineOpen(false);
            router.reload({ only: ['trainee'] });
        } catch (error) {
            setFormError(
                error instanceof ApiError ? error.message : 'Decline failed',
            );
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
                <form
                    onSubmit={handleApproveSubmit(onApprove)}
                    className="flex flex-col gap-3"
                    data-cy="personal-info-tab-approve-form"
                >
                    <div className="w-full sm:max-w-xs">
                        <Controller
                            control={approveControl}
                            name="batch_id"
                            render={({ field }) => (
                                <Field
                                    label="Batch"
                                    error={approveErrors.batch_id?.message}
                                    data-cy="personal-info-tab-field-batch"
                                >
                                    <AsyncSelectField
                                        value={field.value}
                                        initialLabel={batchLabel}
                                        placeholder="Select batch"
                                        loadOptions={(q) =>
                                            loadLookupOptions('/batches', q, 'batch_code')
                                        }
                                        onChange={(v) => field.onChange((v as string) ?? '')}
                                        error={approveErrors.batch_id?.message}
                                    />
                                </Field>
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            icon={approving ? undefined : ShieldCheck}
                            disabled={approving}
                            data-cy="personal-info-tab-button-approve"
                        >
                            {approving && (
                                <Loader2 size={13} className="mr-1 animate-spin" />
                            )}
                            Approve
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={ShieldX}
                            disabled={approving}
                            onClick={() => {
                                setFormError(null);
                                setDeclineOpen(true);
                            }}
                            data-cy="personal-info-tab-button-decline"
                        >
                            Decline
                        </Button>
                    </div>
                </form>
            ) : (
                <form
                    onSubmit={handleDeclineSubmit(onDecline)}
                    className="flex flex-col gap-3"
                    data-cy="personal-info-tab-decline-form"
                >
                    <Field
                        label="Decline remarks"
                        required={false}
                        error={declineErrors.remarks?.message}
                        data-cy="personal-info-tab-field-decline-remarks"
                    >
                        <textarea
                            rows={2}
                            className={cn(
                                textareaCls,
                                declineErrors.remarks && errorInputCls,
                            )}
                            {...registerDecline('remarks')}
                        />
                    </Field>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={declining}
                            onClick={() => {
                                setFormError(null);
                                resetDecline();
                                setDeclineOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            size="sm"
                            disabled={declining}
                            data-cy="personal-info-tab-button-confirm-decline"
                        >
                            {declining && (
                                <Loader2 size={13} className="mr-1 animate-spin" />
                            )}
                            {declining ? 'Declining…' : 'Confirm decline'}
                        </Button>
                    </div>
                </form>
            )}
            {formError && (
                <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs">
                    {formError}
                </p>
            )}
        </div>
    );
}
