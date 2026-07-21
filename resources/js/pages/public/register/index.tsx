import { Head } from '@inertiajs/react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import * as Yup from 'yup';
import { ApiError } from '@/api-service-layer/client';
import { publicRegisterService } from '@/api-service-layer/public/register';
import { LogoMark } from '@/components/Logo';
import type { RegisterPayload } from '@/types/modules/public/register';
import { registerSchema } from './registerSchema';
interface PublicBatch {
    batch_code: string;
    setup: 'f2f' | 'online';
    status: string;
    is_public_url_enable: boolean;
    date_started: string | null;
    industry: string | null;
    level: string | null;
    program: string | null;
}
interface School {
    id: number;
    name: string;
}
const EMPTY_FORM: RegisterPayload = {
    first_name: '',
    last_name: '',
    email: '',
    birthday: '',
    birth_place: '',
    gender: '',
    mobile_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    school_id: '',
    required_hours: '',
    resume: null,
    endorsement_letter: null,
    moa: null,
    liability_waiver: null,
};
const inputCls =
    'w-full rounded-md border border-neutral-200 bg-white px-2.5 h-9 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
function Field({
    label,
    error,
    optional,
    children,
}: {
    label: string;
    error?: string;
    optional?: boolean;
    children: ReactNode;
}) {
    return (
        <div data-cy="index-div-1">
            <label
                className="mb-1 block text-xs font-medium text-neutral-600"
                data-cy="index-label-2"
            >
                {label}
                {optional && (
                    <span
                        className="font-normal text-neutral-400"
                        data-cy="index-span-3"
                    >
                        {' '}
                        (optional)
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-danger-600" data-cy="index-p-4">
                    {error}
                </p>
            )}
        </div>
    );
}
function Shell({ children }: { children: ReactNode }) {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-neutral-50 p-4"
            data-cy="index-div-5"
        >
            <div
                className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
                data-cy="index-div-6"
            >
                {children}
            </div>
        </div>
    );
}
/** Maps a Yup ValidationError (abortEarly: false) into one message per field. */
function fieldErrorsFromYup(
    error: Yup.ValidationError,
): Partial<Record<keyof RegisterPayload, string>> {
    const fieldErrors: Partial<Record<keyof RegisterPayload, string>> = {};

    for (const inner of error.inner) {
        const key = inner.path as keyof RegisterPayload | undefined;

        if (key && !(key in fieldErrors)) {
            fieldErrors[key] = inner.message;
        }
    }

    return fieldErrors;
}
/** Maps the backend's `{errors: {field: string[]}}` shape to one message per field. */
function fieldErrorsFromApi(
    errors: Record<string, string[]>,
): Partial<Record<keyof RegisterPayload, string>> {
    const fieldErrors: Partial<Record<keyof RegisterPayload, string>> = {};

    for (const [key, messages] of Object.entries(errors)) {
        fieldErrors[key as keyof RegisterPayload] = messages[0];
    }

    return fieldErrors;
}
export default function PublicRegisterPage({
    token,
    batch,
    schools,
    metaDescription,
}: {
    token: string;
    batch: PublicBatch;
    schools: School[];
    metaDescription: string;
}) {
    const pageTitle = `Batch Registration · ${batch.batch_code}`;
    const [data, setData] = useState<RegisterPayload>(EMPTY_FORM);
    const [errors, setErrors] = useState<
        Partial<Record<keyof RegisterPayload, string>>
    >({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);

    const setField = <K extends keyof RegisterPayload>(
        key: K,
        value: RegisterPayload[K],
    ) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const mutation = useMutation({
        mutationFn: (payload: RegisterPayload) =>
            publicRegisterService.submit(token, payload),
        onSuccess: () => {
            setSucceeded(true);
        },
        onError: (error: unknown) => {
            // Field-level validation errors (422 from storeRules()) go under the
            // relevant field; anything else (closed batch, network failure, a
            // 500) surfaces as one banner above the form.
            if (error instanceof ApiError && error.errors) {
                setErrors(fieldErrorsFromApi(error.errors));
                setSubmitError(null);
            } else {
                setErrors({});
                setSubmitError(
                    error instanceof Error
                        ? error.message
                        : 'Something went wrong. Please try again.',
                );
            }
        },
    });

    // Success screen after a completed submission.
    if (succeeded) {
        return (
            <Shell data-cy="index-shell-7">
                <div
                    className="flex flex-col items-center py-6 text-center"
                    data-cy="index-div-8"
                >
                    <CheckCircle2
                        className="mb-3 h-12 w-12 text-success-600"
                        data-cy="index-check-circle2-9"
                    />
                    <h1
                        className="text-xl font-semibold text-ink"
                        data-cy="index-h1-registration-received"
                    >
                        Registration received
                    </h1>
                    <p
                        className="mt-2 max-w-md text-sm text-neutral-500"
                        data-cy="index-p-11"
                    >
                        Registration submitted successfully. Our team will be in
                        touch.
                    </p>
                    <p
                        className="mt-1 font-mono text-xs text-neutral-400"
                        data-cy="index-p-12"
                    >
                        {batch.batch_code}
                    </p>
                </div>
            </Shell>
        );
    }

    const header = (
        <div
            className="mb-6 flex flex-col items-center text-center"
            data-cy="index-div-13"
        >
            <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"
                data-cy="index-div-14"
            >
                <LogoMark data-cy="index-logo-mark-15" />
            </div>
            <h1
                className="text-xl font-semibold text-ink"
                data-cy="index-h1-batch-registration"
            >
                Batch Registration
            </h1>
            <p className="mt-1 text-sm text-neutral-500" data-cy="index-p-17">
                {batch.batch_code} · {batch.program ?? '—'} ·{' '}
                {batch.setup === 'f2f' ? 'Face to Face' : 'Online'}
            </p>
        </div>
    );

    // Registration closed unless the batch is active AND its public link is
    // enabled (an admin can disable the link from the batches list).
    if (batch.status !== 'active' || !batch.is_public_url_enable) {
        return (
            <Shell data-cy="index-shell-18">
                {header}
                <p
                    className="rounded-lg bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500"
                    data-cy="index-p-registration-for-this-batch-is-currently"
                >
                    Registration for this batch is currently closed.
                </p>
            </Shell>
        );
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            await registerSchema.validate(data, { abortEarly: false });
            setErrors({});
        } catch (validationError) {
            if (validationError instanceof Yup.ValidationError) {
                setErrors(fieldErrorsFromYup(validationError));
            }

            return;
        }

        try {
            await mutation.mutateAsync(data);
        } catch {
            // Field/banner state is already set by the mutation's onError.
        }
    };
    const fileInput = (key: keyof RegisterPayload) => (
        <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setField(key, e.target.files?.[0] ?? null)}
            className="w-full text-xs text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            data-cy="index-input-file"
        />
    );

    return (
        <Shell data-cy="index-shell-21">
            {/* og:* / twitter:* tags are server-rendered into the Blade <head>
                (see PublicRegistrationController::show + app.blade.php) so
                Facebook's non-JS crawler can scrape them. Only the plain
                description is kept here for in-browser consumers. */}
            <Head title={pageTitle} data-cy="index-head-page-title">
                <meta
                    head-key="description"
                    name="description"
                    content={metaDescription}
                    data-cy="index-meta-description"
                />
            </Head>

            {header}
            {submitError && (
                <p
                    className="text-danger-700 mb-4 rounded-md bg-danger-50 px-3 py-2 text-xs"
                    data-cy="index-p-24"
                >
                    {submitError}
                </p>
            )}

            <form
                onSubmit={submit}
                className="space-y-5"
                data-cy="index-form-submit"
            >
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    data-cy="index-div-26"
                >
                    <Field
                        label="First name"
                        error={errors.first_name}
                        data-cy="index-field-first-name"
                    >
                        <input
                            className={inputCls}
                            value={data.first_name}
                            onChange={(e) =>
                                setField('first_name', e.target.value)
                            }
                            data-cy="index-input-set-data"
                        />
                    </Field>
                    <Field
                        label="Last name"
                        error={errors.last_name}
                        data-cy="index-field-last-name"
                    >
                        <input
                            className={inputCls}
                            value={data.last_name}
                            onChange={(e) =>
                                setField('last_name', e.target.value)
                            }
                            data-cy="index-input-set-data-2"
                        />
                    </Field>
                    <Field
                        label="Email"
                        error={errors.email}
                        data-cy="index-field-email"
                    >
                        <input
                            type="email"
                            className={inputCls}
                            value={data.email}
                            onChange={(e) => setField('email', e.target.value)}
                            data-cy="index-input-email"
                        />
                    </Field>
                    <Field
                        label="Mobile number"
                        error={errors.mobile_number}
                        data-cy="index-field-mobile-number"
                    >
                        <input
                            className={inputCls}
                            value={data.mobile_number}
                            onChange={(e) =>
                                setField('mobile_number', e.target.value)
                            }
                            data-cy="index-input-set-data-3"
                        />
                    </Field>
                    <Field
                        label="Date of birth"
                        error={errors.birthday}
                        data-cy="index-field-date-of-birth"
                    >
                        <input
                            type="date"
                            className={inputCls}
                            value={data.birthday}
                            onChange={(e) =>
                                setField('birthday', e.target.value)
                            }
                            data-cy="index-input-date"
                        />
                    </Field>
                    <Field
                        label="Place of birth"
                        error={errors.birth_place}
                        data-cy="index-field-place-of-birth"
                    >
                        <input
                            className={inputCls}
                            value={data.birth_place}
                            onChange={(e) =>
                                setField('birth_place', e.target.value)
                            }
                            data-cy="index-input-set-data-4"
                        />
                    </Field>
                    <Field
                        label="Gender"
                        error={errors.gender}
                        data-cy="index-field-gender"
                    >
                        <select
                            className={inputCls}
                            value={data.gender}
                            onChange={(e) => setField('gender', e.target.value)}
                            data-cy="index-select-set-data"
                        >
                            <option
                                value=""
                                disabled
                                data-cy="index-option-select-gender"
                            >
                                Select gender…
                            </option>
                            <option value="male" data-cy="index-option-male">
                                Male
                            </option>
                            <option
                                value="female"
                                data-cy="index-option-female"
                            >
                                Female
                            </option>
                        </select>
                    </Field>
                    <Field
                        label="Required hours"
                        error={errors.required_hours}
                        data-cy="index-field-required-hours"
                    >
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className={inputCls}
                            value={data.required_hours}
                            onChange={(e) =>
                                setField('required_hours', e.target.value)
                            }
                            data-cy="index-input-number"
                        />
                    </Field>
                    <Field
                        label="Partner school"
                        error={errors.school_id}
                        data-cy="index-field-partner-school"
                    >
                        <select
                            className={inputCls}
                            value={data.school_id}
                            onChange={(e) =>
                                setField('school_id', e.target.value)
                            }
                            data-cy="index-select-set-data-2"
                        >
                            <option
                                value=""
                                disabled
                                data-cy="index-option-select-school"
                            >
                                Select school…
                            </option>
                            {schools.map((s) => (
                                <option
                                    key={s.id}
                                    value={s.id}
                                    data-cy="index-option-49"
                                >
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field
                    label="Complete address"
                    error={errors.address}
                    data-cy="index-field-complete-address"
                >
                    <textarea
                        rows={2}
                        className={`${inputCls} h-auto resize-none py-2`}
                        value={data.address}
                        onChange={(e) => setField('address', e.target.value)}
                        data-cy="index-textarea-set-data"
                    />
                </Field>

                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    data-cy="index-div-52"
                >
                    <Field
                        label="Emergency contact name"
                        error={errors.emergency_contact_name}
                        data-cy="index-field-emergency-contact-name"
                    >
                        <input
                            className={inputCls}
                            value={data.emergency_contact_name}
                            onChange={(e) =>
                                setField(
                                    'emergency_contact_name',
                                    e.target.value,
                                )
                            }
                            data-cy="index-input-set-data-5"
                        />
                    </Field>
                    <Field
                        label="Emergency contact number"
                        error={errors.emergency_contact_number}
                        data-cy="index-field-emergency-contact-number"
                    >
                        <input
                            className={inputCls}
                            value={data.emergency_contact_number}
                            onChange={(e) =>
                                setField(
                                    'emergency_contact_number',
                                    e.target.value,
                                )
                            }
                            data-cy="index-input-set-data-6"
                        />
                    </Field>
                </div>

                <div
                    className="space-y-4 rounded-lg border border-neutral-200 p-4"
                    data-cy="index-div-57"
                >
                    <p
                        className="text-xs font-semibold text-neutral-600"
                        data-cy="index-p-documents"
                    >
                        Documents
                    </p>
                    <Field
                        label="Resume / CV"
                        error={errors.resume}
                        data-cy="index-field-resume-cv"
                    >
                        {fileInput('resume')}
                    </Field>
                    <div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                        data-cy="index-div-60"
                    >
                        <Field
                            label="Endorsement letter"
                            optional
                            error={errors.endorsement_letter}
                            data-cy="index-field-endorsement-letter"
                        >
                            {fileInput('endorsement_letter')}
                        </Field>
                        <Field
                            label="MOA"
                            optional
                            error={errors.moa}
                            data-cy="index-field-moa"
                        >
                            {fileInput('moa')}
                        </Field>
                        <Field
                            label="Liability waiver"
                            optional
                            error={errors.liability_waiver}
                            data-cy="index-field-liability-waiver"
                        >
                            {fileInput('liability_waiver')}
                        </Field>
                    </div>
                    <p
                        className="text-xs text-neutral-400"
                        data-cy="index-p-accepted-pdf-doc-docx-jpg-png-max"
                    >
                        Accepted: PDF, DOC/DOCX, JPG, PNG (max 5&nbsp;MB each).
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                    data-cy="index-button-submit"
                >
                    {mutation.isPending && (
                        <Loader2
                            className="h-4 w-4 animate-spin"
                            data-cy="index-loader2-66"
                        />
                    )}
                    Submit registration
                </button>
            </form>
        </Shell>
    );
}
