import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Circle, Loader2, Mail, Send, User, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { errorInputCls, Field, inputCls, textareaCls } from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { useNotifications } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';

/** Fixed "today" so the Seminars demo data (progress calcs, etc.) stays consistent. */
const TODAY = new Date('2026-07-01');
import type { SeminarParticipant, SeminarProgress } from '@/types';
import { PARTICIPANT_STATUS_STYLE, progressPercent } from './seminarUtils';

const PAYMENT_STATUS_OPTIONS = ['Pending', 'Paid', 'Refunded', 'Waived'] as const;

// Mirrors SeminarParticipantsController::update()'s `payment.*` rules: status
// is one of the fixed enum values, date/amount/referenceNo/remarks are all
// `sometimes|nullable` — only format/range needs client-side checking, no
// field is hard-required.
const paymentSchema = z.object({
    status: z.enum(PAYMENT_STATUS_OPTIONS),
    date: z.string(),
    amount: z
        .string()
        .refine(
            (v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0),
            'Amount paid must be a number of 0 or more.',
        ),
    referenceNo: z
        .string()
        .max(255, 'Reference number must be 255 characters or fewer.'),
    remarks: z.string(),
});

type PaymentDraft = z.infer<typeof paymentSchema>;

const PROGRESS_STEPS: {
    key: keyof SeminarProgress;
    label: string;
}[] = [
    {
        key: 'registration',
        label: 'Registration',
    },
    {
        key: 'payment',
        label: 'Payment',
    },
    {
        key: 'seminarProper',
        label: 'Seminar proper',
    },
    {
        key: 'feedbackForm',
        label: 'Feedback form',
    },
    {
        key: 'certificate',
        label: 'Certificate',
    },
];
interface Props {
    open: boolean;
    onClose: () => void;
    participant: SeminarParticipant | null;
    onUpdate: (id: string, patch: Partial<SeminarParticipant>) => void;
}
export function ParticipantDetailModal({
    open,
    onClose,
    participant,
    onUpdate,
}: Props) {
    const { showToast } = useToast();
    const { notify } = useNotifications();
    const {
        control,
        register,
        reset,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: savingPayment },
    } = useForm<PaymentDraft>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            status: 'Pending',
            date: '',
            amount: '',
            referenceNo: '',
            remarks: '',
        },
    });
    const [paymentError, setPaymentError] = useState<string | null>(null);
    useEffect(() => {
        if (participant) {
            reset({
                status: participant.payment?.status ?? 'Pending',
                date: participant.payment?.date ?? '',
                amount:
                    participant.payment?.amount != null
                        ? String(participant.payment.amount)
                        : '',
                referenceNo: participant.payment?.referenceNo ?? '',
                remarks: participant.payment?.remarks ?? '',
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect -- clears a stale error from a previous open, same as AddTaskModal's reset-on-open effect
            setPaymentError(null);
        }
    }, [participant, reset]);

    if (!participant) {
        return null;
    }

    const pct = progressPercent(participant);
    function toggleStep(key: keyof SeminarProgress) {
        const base: SeminarProgress = participant!.progress ?? {
            registration: false,
            payment: false,
            seminarProper: false,
            feedbackForm: false,
            certificate: false,
        };
        onUpdate(participant!.id, {
            progress: {
                ...base,
                [key]: !base[key],
            },
        });
    }
    async function onValidPayment(draft: PaymentDraft) {
        setPaymentError(null);

        try {
            await onUpdate(participant!.id, {
                payment: {
                    status: draft.status as any,
                    date: draft.date || undefined,
                    amount: draft.amount ? Number(draft.amount) : undefined,
                    referenceNo: draft.referenceNo || undefined,
                    remarks: draft.remarks || undefined,
                },
            });
            showToast('Payment information updated.', 'success');
        } catch (err: unknown) {
            setPaymentError(
                err instanceof Error ? err.message : 'Failed to update payment.',
            );
        }
    }
    function resend(kind: string) {
        showToast(`${kind} email sent to ${participant!.email}.`, 'success');
        notify({
            audience: 'trainee',
            title: `${kind} email`,
            body: `${kind} email sent to ${participant!.name} (${participant!.seminarTopic}).`,
            createdAt: TODAY.toISOString(),
            link: '/seminars',
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Participant details"
            maxWidth={560}
            data-cy="participant-detail-modal-modal-participant-details"
        >
            <div
                className="mb-4 flex items-start justify-between gap-3"
                data-cy="participant-detail-modal-div-2"
            >
                <div
                    className="flex items-center gap-3"
                    data-cy="participant-detail-modal-div-3"
                >
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600"
                        data-cy="participant-detail-modal-div-4"
                    >
                        {participant.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                    </div>
                    <div data-cy="participant-detail-modal-div-5">
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="participant-detail-modal-h3-6"
                        >
                            {participant.name}
                        </h3>
                        <p
                            className="text-xs text-neutral-500"
                            data-cy="participant-detail-modal-p-7"
                        >
                            {participant.seminarTopic}
                        </p>
                    </div>
                </div>
                <span
                    className={cn(
                        'shrink-0 rounded-pill px-2.5 py-0.5 text-xs font-medium',
                        PARTICIPANT_STATUS_STYLE[participant.status],
                    )}
                    data-cy="participant-detail-modal-span-8"
                >
                    {participant.status}
                </span>
            </div>

            {/* Personal information */}
            <section
                className="mb-4 rounded-lg border border-neutral-200 p-3"
                data-cy="participant-detail-modal-section-9"
            >
                <h4
                    className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600"
                    data-cy="participant-detail-modal-h4-personal-information"
                >
                    <User
                        size={13}
                        className="text-brand-500"
                        data-cy="participant-detail-modal-user-11"
                    />{' '}
                    Personal information
                </h4>
                <dl
                    className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
                    data-cy="participant-detail-modal-dl-12"
                >
                    <div data-cy="participant-detail-modal-div-13">
                        <dt
                            className="text-[11px] text-neutral-400"
                            data-cy="participant-detail-modal-dt-email"
                        >
                            Email
                        </dt>
                        <dd
                            className="truncate text-neutral-700"
                            data-cy="participant-detail-modal-dd-15"
                        >
                            {participant.email}
                        </dd>
                    </div>
                    <div data-cy="participant-detail-modal-div-16">
                        <dt
                            className="text-[11px] text-neutral-400"
                            data-cy="participant-detail-modal-dt-mobile"
                        >
                            Mobile
                        </dt>
                        <dd
                            className="text-neutral-700"
                            data-cy="participant-detail-modal-dd-18"
                        >
                            {participant.mobile || '—'}
                        </dd>
                    </div>
                    <div data-cy="participant-detail-modal-div-19">
                        <dt
                            className="text-[11px] text-neutral-400"
                            data-cy="participant-detail-modal-dt-location"
                        >
                            Location
                        </dt>
                        <dd
                            className="text-neutral-700"
                            data-cy="participant-detail-modal-dd-21"
                        >
                            {participant.location || '—'}
                        </dd>
                    </div>
                    <div data-cy="participant-detail-modal-div-22">
                        <dt
                            className="text-[11px] text-neutral-400"
                            data-cy="participant-detail-modal-dt-profession"
                        >
                            Profession
                        </dt>
                        <dd
                            className="text-neutral-700"
                            data-cy="participant-detail-modal-dd-24"
                        >
                            {participant.profession || '—'}
                        </dd>
                    </div>
                    {participant.isStudent && (
                        <div data-cy="participant-detail-modal-div-25">
                            <dt
                                className="text-[11px] text-neutral-400"
                                data-cy="participant-detail-modal-dt-student-id"
                            >
                                Student ID
                            </dt>
                            <dd
                                className="text-neutral-700"
                                data-cy="participant-detail-modal-dd-27"
                            >
                                {participant.studentId || '—'}
                            </dd>
                        </div>
                    )}
                </dl>
            </section>

            {/* Registration progress checklist */}
            <section
                className="mb-4 rounded-lg border border-neutral-200 p-3"
                data-cy="participant-detail-modal-section-28"
            >
                <div
                    className="mb-2 flex items-center justify-between"
                    data-cy="participant-detail-modal-div-29"
                >
                    <h4
                        className="text-xs font-semibold text-neutral-600"
                        data-cy="participant-detail-modal-h4-registration-progress"
                    >
                        Registration progress
                    </h4>
                    <span
                        className="text-[11px] font-medium text-neutral-500"
                        data-cy="participant-detail-modal-span-complete"
                    >
                        {pct}% complete
                    </span>
                </div>
                <div
                    className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                    data-cy="participant-detail-modal-div-32"
                >
                    <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{
                            width: `${pct}%`,
                        }}
                        data-cy="participant-detail-modal-div-33"
                    />
                </div>
                <div
                    className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                    data-cy="participant-detail-modal-div-34"
                >
                    {PROGRESS_STEPS.map((step) => {
                        const done = !!participant.progress?.[step.key];

                        return (
                            <button
                                key={step.key}
                                onClick={() => toggleStep(step.key)}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors',
                                    done
                                        ? 'border-success-100 bg-success-50 text-success-800'
                                        : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50',
                                )}
                                data-cy="participant-detail-modal-button-toggle-step"
                            >
                                {done ? (
                                    <CheckCircle2
                                        size={13}
                                        className="shrink-0"
                                        data-cy="participant-detail-modal-check-circle2-36"
                                    />
                                ) : (
                                    <Circle
                                        size={13}
                                        className="shrink-0"
                                        data-cy="participant-detail-modal-circle-37"
                                    />
                                )}
                                <span
                                    className="truncate"
                                    data-cy="participant-detail-modal-span-38"
                                >
                                    {step.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Payment information */}
            <section
                className="mb-4 rounded-lg border border-neutral-200 p-3"
                data-cy="participant-detail-modal-section-39"
            >
                <h4
                    className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600"
                    data-cy="participant-detail-modal-h4-payment-information"
                >
                    <Wallet
                        size={13}
                        className="text-brand-500"
                        data-cy="participant-detail-modal-wallet-41"
                    />{' '}
                    Payment information
                </h4>
                <form
                    onSubmit={handleFormSubmit(onValidPayment)}
                    className="space-y-0"
                    data-cy="participant-detail-modal-payment-form"
                >
                    <div
                        className="grid grid-cols-2 gap-x-3 gap-y-0"
                        data-cy="participant-detail-modal-div-42"
                    >
                        <Field
                            label="Payment status"
                            error={errors.status?.message}
                            data-cy="participant-detail-modal-field-payment-status"
                        >
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <select
                                        className={cn(inputCls, errors.status && errorInputCls)}
                                        value={field.value}
                                        onChange={field.onChange}
                                        data-cy="participant-detail-modal-select-field-payment-status"
                                    >
                                        {PAYMENT_STATUS_OPTIONS.map((o) => (
                                            <option key={o} value={o}>
                                                {o}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        </Field>
                        <Field
                            label="Payment date"
                            error={errors.date?.message}
                            data-cy="participant-detail-modal-field-payment-date"
                        >
                            <input
                                type="date"
                                className={cn(inputCls, errors.date && errorInputCls)}
                                {...register('date')}
                                data-cy="participant-detail-modal-text-field-payment-date"
                            />
                        </Field>
                        <Field
                            label="Amount paid"
                            error={errors.amount?.message}
                            data-cy="participant-detail-modal-field-amount-paid"
                        >
                            <input
                                type="number"
                                placeholder="0"
                                className={cn(inputCls, errors.amount && errorInputCls)}
                                {...register('amount')}
                                data-cy="participant-detail-modal-text-field-amount-paid"
                            />
                        </Field>
                        <Field
                            label="Reference number"
                            error={errors.referenceNo?.message}
                            data-cy="participant-detail-modal-field-reference-number"
                        >
                            <input
                                placeholder="e.g. GC-88213041"
                                className={cn(inputCls, errors.referenceNo && errorInputCls)}
                                {...register('referenceNo')}
                                data-cy="participant-detail-modal-text-field-reference-number"
                            />
                        </Field>
                    </div>
                    <Field
                        label="Remarks"
                        required={false}
                        error={errors.remarks?.message}
                        data-cy="participant-detail-modal-field-remarks"
                    >
                        <textarea
                            placeholder="Notes about this payment"
                            className={cn(textareaCls, errors.remarks && errorInputCls)}
                            {...register('remarks')}
                            data-cy="participant-detail-modal-text-area-field-remarks"
                        />
                    </Field>
                    {paymentError && (
                        <p
                            className="text-danger-700 mb-2 rounded-md bg-danger-50 px-3 py-2 text-xs"
                            data-cy="participant-detail-modal-p-payment-error"
                        >
                            {paymentError}
                        </p>
                    )}
                    <div
                        className="flex justify-end"
                        data-cy="participant-detail-modal-div-48"
                    >
                        <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={savingPayment}
                            data-cy="participant-detail-modal-button-save-payment"
                        >
                            {savingPayment && (
                                <Loader2
                                    size={13}
                                    className="animate-spin"
                                    data-cy="participant-detail-modal-loader"
                                />
                            )}
                            Save payment info
                        </Button>
                    </div>
                </form>
            </section>

            {/* Resend communications */}
            <section
                className="mb-1"
                data-cy="participant-detail-modal-section-50"
            >
                <h4
                    className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-600"
                    data-cy="participant-detail-modal-h4-resend-email"
                >
                    <Mail
                        size={13}
                        className="text-brand-500"
                        data-cy="participant-detail-modal-mail-52"
                    />{' '}
                    Resend email
                </h4>
                <div
                    className="flex flex-wrap gap-2"
                    data-cy="participant-detail-modal-div-53"
                >
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Send}
                        onClick={() => resend('Payment instructions')}
                        data-cy="participant-detail-modal-button-resend"
                    >
                        Payment instructions
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Send}
                        onClick={() => resend('Seminar reminder')}
                        data-cy="participant-detail-modal-button-resend-2"
                    >
                        Seminar reminder
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Send}
                        onClick={() => resend('Certificate')}
                        data-cy="participant-detail-modal-button-resend-3"
                    >
                        Certificate
                    </Button>
                </div>
            </section>

            <div
                className="mt-5 flex justify-end"
                data-cy="participant-detail-modal-div-57"
            >
                <Button
                    variant="secondary"
                    onClick={onClose}
                    data-cy="participant-detail-modal-button-close"
                >
                    Close
                </Button>
            </div>
        </Modal>
    );
}
