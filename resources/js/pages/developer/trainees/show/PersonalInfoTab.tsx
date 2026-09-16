import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Check, KeyRound, Loader2, Pencil, Unlink, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { traineeService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { errorInputCls, Field as FormField, inputCls } from '@/components/form/Field';
import { useToast } from '@/components/Toast';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { apiFetchJson } from '@/lib/apiFetch';
import { formatDateShort } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { ApprovalSection } from './ApprovalSection';

function AccountLinkSection({ trainee }: { trainee: TraineeDetail }) {
    const { showToast } = useToast();
    const [busy, setBusy] = useState(false);
    const isLinked = trainee.user !== null;
    const canLogin = trainee.user?.status === 'active';

    const toggle = async () => {
        setBusy(true);

        try {
            await apiFetchJson(
                `/trainees/${trainee.id}/${canLogin ? 'unlink-account' : 'link-account'}`,
                { method: 'PATCH' },
            );
            showToast(
                canLogin
                    ? 'This trainee can no longer log in.'
                    : isLinked
                      ? 'This trainee can log in again.'
                      : 'An invite email was sent to set up their password.',
                'success',
            );
            router.reload({ only: ['trainee'] });
        } catch (error) {
            showToast(
                error instanceof ApiError ? error.message : 'Action failed',
                'error',
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="mt-4 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            data-cy="personal-info-tab-account-section"
        >
            <div data-cy="personal-info-tab-account-info">
                <div className="text-xs text-neutral-500">Account access</div>
                <div className="mt-1 text-sm text-ink">
                    {isLinked ? (
                        <>
                            {trainee.user!.email} —{' '}
                            <span
                                className={
                                    canLogin
                                        ? 'text-success-700'
                                        : 'text-neutral-500'
                                }
                            >
                                {canLogin ? 'Can log in' : 'Login disabled'}
                            </span>
                        </>
                    ) : (
                        'No account linked yet.'
                    )}
                </div>
            </div>
            <Button
                variant={canLogin ? 'danger' : 'secondary'}
                size="sm"
                icon={canLogin ? Unlink : KeyRound}
                disabled={busy}
                onClick={() => void toggle()}
                data-cy="personal-info-tab-button-toggle-account"
            >
                {canLogin
                    ? 'Unlink account'
                    : isLinked
                      ? 'Link account'
                      : 'Create & link account'}
            </Button>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div data-cy="personal-info-tab-div-1">
            <div
                className="text-xs text-neutral-500"
                data-cy="personal-info-tab-div-2"
            >
                {label}
            </div>
            <div
                className="mt-1 text-sm text-ink"
                data-cy="personal-info-tab-div-3"
            >
                {value || '—'}
            </div>
        </div>
    );
}

type Values = {
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    birth_place: string;
    gender: 'male' | 'female';
    mobile_number: string;
    landline_number: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    address: string;
};

// Mirrors TraineesController::updateRules() for the fields this tab edits:
// first/last name, birth place, mobile number, emergency contact name
// required strings <= 255/50; email required valid email; birthday required
// date; gender required in:male,female; landline_number nullable <= 50;
// address required string.
const personalInfoSchema = z.object({
    first_name: z
        .string()
        .trim()
        .min(1, 'First name is required.')
        .max(255, 'First name must be 255 characters or fewer.'),
    last_name: z
        .string()
        .trim()
        .min(1, 'Last name is required.')
        .max(255, 'Last name must be 255 characters or fewer.'),
    email: z
        .string()
        .trim()
        .min(1, 'Email is required.')
        .email('Enter a valid email address.'),
    birthday: z.string().min(1, 'Birth date is required.'),
    birth_place: z
        .string()
        .trim()
        .min(1, 'Birth place is required.')
        .max(255, 'Birth place must be 255 characters or fewer.'),
    gender: z.enum(['male', 'female'], {
        message: 'Gender is required.',
    }),
    mobile_number: z
        .string()
        .trim()
        .min(1, 'Mobile number is required.')
        .max(50, 'Mobile number must be 50 characters or fewer.'),
    landline_number: z
        .string()
        .max(50, 'Landline number must be 50 characters or fewer.'),
    emergency_contact_name: z
        .string()
        .trim()
        .min(1, 'Emergency contact name is required.')
        .max(255, 'Emergency contact name must be 255 characters or fewer.'),
    emergency_contact_number: z
        .string()
        .trim()
        .min(1, 'Emergency contact number is required.')
        .max(50, 'Emergency contact number must be 50 characters or fewer.'),
    address: z.string().trim().min(1, 'Address is required.'),
}) satisfies z.ZodType<Values>;

interface Props {
    trainee: TraineeDetail;
}

export default function PersonalInfoTab({ trainee }: Props) {
    const { showToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [saved, setSaved] = useState<Values>({
        first_name: trainee.first_name,
        last_name: trainee.last_name,
        email: trainee.email,
        birthday: trainee.birthday,
        birth_place: trainee.birth_place,
        gender: trainee.gender ?? 'male',
        mobile_number: trainee.mobile_number,
        landline_number: trainee.landline_number ?? '',
        emergency_contact_name: trainee.emergency_contact_name,
        emergency_contact_number: trainee.emergency_contact_number,
        address: trainee.address,
    });
    const {
        register,
        reset,
        setError,
        handleSubmit: handleFormSubmit,
        formState: { errors, isSubmitting: saving },
    } = useForm<Values>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: saved,
    });
    const startEdit = () => {
        reset(saved);
        setFormError(null);
        setEditing(true);
    };
    const cancel = () => {
        reset(saved);
        setFormError(null);
        setEditing(false);
    };
    const onValid = async (values: Values) => {
        setFormError(null);

        try {
            await traineeService.update(trainee.id, {
                ...trainee,
                ...values,
            });
            setSaved(values);
            setEditing(false);
            showToast('Personal information updated', 'success');
            router.reload({ only: ['trainee'] });
        } catch (error) {
            if (error instanceof ApiError && error.errors) {
                Object.entries(error.errors).forEach(([key, msgs]) => {
                    setError(key as keyof Values, {
                        message: Array.isArray(msgs) ? msgs[0] : String(msgs),
                    });
                });
            }

            setFormError(
                error instanceof ApiError
                    ? error.message
                    : 'Failed to save changes',
            );
        }
    };

    return (
        <TraineesDetailLayout trainee={trainee}>
            <div
                className="rounded-lg border border-neutral-200 bg-white p-5"
                data-cy="personal-info-tab-div-4"
            >
                <div className="grid grid-cols-[1fr_120px] gap-5">
                    {!editing ? (
                        <div
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="personal-info-tab-div-15"
                        >
                            <Field
                                label="Full name"
                                value={trainee.name}
                                data-cy="personal-info-tab-field-full-name"
                            />
                            <Field
                                label="Email address"
                                value={saved.email}
                                data-cy="personal-info-tab-field-email-address"
                            />
                            <Field
                                label="Birth date"
                                value={formatDateShort(saved.birthday)}
                                data-cy="personal-info-tab-field-birth-date"
                            />
                            <Field
                                label="Birth place"
                                value={saved.birth_place}
                                data-cy="personal-info-tab-field-birth-place"
                            />
                            <Field
                                label="Gender"
                                value={saved.gender ?? ''}
                                data-cy="personal-info-tab-field-gender"
                            />
                            <Field
                                label="Mobile number"
                                value={saved.mobile_number}
                                data-cy="personal-info-tab-field-mobile-number"
                            />
                            <Field
                                label="Landline number"
                                value={saved.landline_number ?? ''}
                                data-cy="personal-info-tab-field-landline-number"
                            />
                            <Field
                                label="Emergency contact name"
                                value={saved.emergency_contact_name}
                                data-cy="personal-info-tab-field-emergency-contact-name"
                            />
                            <Field
                                label="Emergency contact number"
                                value={saved.emergency_contact_number}
                                data-cy="personal-info-tab-field-emergency-contact-number"
                            />
                            <div
                                className="sm:col-span-2 lg:col-span-3"
                                data-cy="personal-info-tab-div-25"
                            >
                                <Field
                                    label="Address"
                                    value={saved.address}
                                    data-cy="personal-info-tab-field-address"
                                />
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleFormSubmit(onValid)}
                            className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="personal-info-tab-div-27"
                        >
                            <FormField
                                label="First name"
                                error={errors.first_name?.message}
                                data-cy="personal-info-tab-text-field-first-name"
                            >
                                <input
                                    className={cn(inputCls, errors.first_name && errorInputCls)}
                                    {...register('first_name')}
                                    data-cy="personal-info-tab-input-first-name"
                                />
                            </FormField>
                            <FormField
                                label="Last name"
                                error={errors.last_name?.message}
                                data-cy="personal-info-tab-text-field-last-name"
                            >
                                <input
                                    className={cn(inputCls, errors.last_name && errorInputCls)}
                                    {...register('last_name')}
                                    data-cy="personal-info-tab-input-last-name"
                                />
                            </FormField>
                            <FormField
                                label="Email address"
                                error={errors.email?.message}
                                data-cy="personal-info-tab-text-field-email-address"
                            >
                                <input
                                    type="email"
                                    className={cn(inputCls, errors.email && errorInputCls)}
                                    {...register('email')}
                                    data-cy="personal-info-tab-input-email-address"
                                />
                            </FormField>
                            <FormField
                                label="Birth date"
                                error={errors.birthday?.message}
                                data-cy="personal-info-tab-text-field-birth-date"
                            >
                                <input
                                    type="date"
                                    className={cn(inputCls, errors.birthday && errorInputCls)}
                                    {...register('birthday')}
                                    data-cy="personal-info-tab-input-birth-date"
                                />
                            </FormField>
                            <FormField
                                label="Birth place"
                                error={errors.birth_place?.message}
                                data-cy="personal-info-tab-text-field-birth-place"
                            >
                                <input
                                    className={cn(inputCls, errors.birth_place && errorInputCls)}
                                    {...register('birth_place')}
                                    data-cy="personal-info-tab-input-birth-place"
                                />
                            </FormField>
                            <FormField
                                label="Gender"
                                error={errors.gender?.message}
                                data-cy="personal-info-tab-select-field-gender"
                            >
                                <select
                                    className={cn(inputCls, errors.gender && errorInputCls)}
                                    {...register('gender')}
                                    data-cy="personal-info-tab-select-gender"
                                >
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                </select>
                            </FormField>
                            <FormField
                                label="Mobile number"
                                error={errors.mobile_number?.message}
                                data-cy="personal-info-tab-text-field-mobile-number"
                            >
                                <input
                                    className={cn(inputCls, errors.mobile_number && errorInputCls)}
                                    {...register('mobile_number')}
                                    data-cy="personal-info-tab-input-mobile-number"
                                />
                            </FormField>
                            <FormField
                                label="Landline number (optional)"
                                required={false}
                                error={errors.landline_number?.message}
                                data-cy="personal-info-tab-text-field-landline-number"
                            >
                                <input
                                    className={cn(inputCls, errors.landline_number && errorInputCls)}
                                    {...register('landline_number')}
                                    data-cy="personal-info-tab-input-landline-number"
                                />
                            </FormField>
                            <FormField
                                label="Emergency contact name"
                                error={errors.emergency_contact_name?.message}
                                data-cy="personal-info-tab-text-field-emergency-contact-name"
                            >
                                <input
                                    className={cn(inputCls, errors.emergency_contact_name && errorInputCls)}
                                    {...register('emergency_contact_name')}
                                    data-cy="personal-info-tab-input-emergency-contact-name"
                                />
                            </FormField>
                            <FormField
                                label="Emergency contact number"
                                error={errors.emergency_contact_number?.message}
                                data-cy="personal-info-tab-text-field-emergency-contact-number"
                            >
                                <input
                                    className={cn(inputCls, errors.emergency_contact_number && errorInputCls)}
                                    {...register('emergency_contact_number')}
                                    data-cy="personal-info-tab-input-emergency-contact-number"
                                />
                            </FormField>
                            <div
                                className="sm:col-span-2 lg:col-span-3"
                                data-cy="personal-info-tab-div-37"
                            >
                                <FormField
                                    label="Address"
                                    error={errors.address?.message}
                                    data-cy="personal-info-tab-text-field-address"
                                >
                                    <input
                                        className={cn(inputCls, errors.address && errorInputCls)}
                                        {...register('address')}
                                        data-cy="personal-info-tab-input-address"
                                    />
                                </FormField>
                            </div>
                            {formError && (
                                <div
                                    className="sm:col-span-2 lg:col-span-3"
                                    data-cy="personal-info-tab-div-form-error"
                                >
                                    <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs">
                                        {formError}
                                    </p>
                                </div>
                            )}
                        </form>
                    )}
                    {!editing ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Pencil}
                            onClick={startEdit}
                            data-cy="personal-info-tab-button-start-edit"
                        >
                            Edit
                        </Button>
                    ) : (
                        <div
                            className="flex flex-col gap-2"
                            data-cy="personal-info-tab-div-12"
                        >
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={X}
                                onClick={cancel}
                                disabled={saving}
                                data-cy="personal-info-tab-button-cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                icon={saving ? undefined : Check}
                                onClick={handleFormSubmit(onValid)}
                                disabled={saving}
                                data-cy="personal-info-tab-button-save"
                            >
                                {saving && (
                                    <Loader2
                                        size={13}
                                        className="mr-1 animate-spin"
                                        data-cy="personal-info-tab-loader"
                                    />
                                )}
                                {saving ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {trainee.status === 'pending' ? (
                <ApprovalSection trainee={trainee} />
            ) : (
                <AccountLinkSection trainee={trainee} />
            )}
        </TraineesDetailLayout>
    );
}
