import { Head } from '@inertiajs/react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ApiError } from '@/api-service-layer/client';
import { publicSeminarRegisterService } from '@/api-service-layer/public/seminarRegister';
import { LogoMark } from '@/components/Logo';
import type { SeminarRegisterPayload } from '@/types/modules/public/seminarRegister';

interface PublicSeminar {
    topic: string;
    description: string;
    date: string | null;
    venue: string;
    fee: number;
    status: string;
    is_public_url_enable: boolean;
}

const EMPTY_FORM: SeminarRegisterPayload = {
    name: '',
    email: '',
    mobile: '',
    location: '',
    profession: '',
    is_student: false,
    student_id: '',
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
        <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
                {label}
                {optional && (
                    <span className="font-normal text-neutral-400">
                        {' '}
                        (optional)
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-danger-600">{error}</p>
            )}
        </div>
    );
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                {children}
            </div>
        </div>
    );
}

function fieldErrorsFromApi(
    errors: Record<string, string[]>,
): Partial<Record<keyof SeminarRegisterPayload, string>> {
    const fieldErrors: Partial<Record<keyof SeminarRegisterPayload, string>> =
        {};

    for (const [key, messages] of Object.entries(errors)) {
        fieldErrors[key as keyof SeminarRegisterPayload] = messages[0];
    }

    return fieldErrors;
}

function validate(
    data: SeminarRegisterPayload,
): Partial<Record<keyof SeminarRegisterPayload, string>> {
    const errors: Partial<Record<keyof SeminarRegisterPayload, string>> = {};

    if (!data.name.trim()) {
errors.name = 'Full name is required.';
}

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
errors.email = 'A valid email is required.';
}

    if (!data.mobile.trim()) {
errors.mobile = 'Mobile number is required.';
}

    if (!data.location.trim()) {
errors.location = 'Location is required.';
}

    if (!data.profession.trim()) {
errors.profession = 'Profession is required.';
}

    if (data.is_student && !data.student_id.trim()) {
errors.student_id = 'Student ID is required for students.';
}

    return errors;
}

export default function PublicSeminarRegisterPage({
    token,
    seminar,
}: {
    token: string;
    seminar: PublicSeminar;
}) {
    const [data, setData] = useState<SeminarRegisterPayload>(EMPTY_FORM);
    const [errors, setErrors] = useState<
        Partial<Record<keyof SeminarRegisterPayload, string>>
    >({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);

    const setField = <K extends keyof SeminarRegisterPayload>(
        key: K,
        value: SeminarRegisterPayload[K],
    ) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const mutation = useMutation({
        mutationFn: (payload: SeminarRegisterPayload) =>
            publicSeminarRegisterService.submit(token, payload),
        onSuccess: () => setSucceeded(true),
        onError: (error: unknown) => {
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

    if (succeeded) {
        return (
            <Shell>
                <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle2 className="mb-3 h-12 w-12 text-success-600" />
                    <h1 className="text-xl font-semibold text-ink">
                        Registration received
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-neutral-500">
                        Registration submitted successfully. Our team will be
                        in touch.
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                        {seminar.topic}
                    </p>
                </div>
            </Shell>
        );
    }

    const header = (
        <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <LogoMark />
            </div>
            <h1 className="text-xl font-semibold text-ink">
                Seminar Registration
            </h1>
            <p className="mt-1 text-sm text-neutral-500">{seminar.topic}</p>
            {seminar.date && (
                <p className="mt-0.5 text-xs text-neutral-400">
                    {seminar.date} · {seminar.venue} ·{' '}
                    {seminar.fee > 0
                        ? `PHP ${seminar.fee.toLocaleString()}`
                        : 'Free'}
                </p>
            )}
        </div>
    );

    if (seminar.status !== 'active' || !seminar.is_public_url_enable) {
        return (
            <Shell>
                {header}
                <p className="rounded-lg bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                    Registration for this seminar is currently closed.
                </p>
            </Shell>
        );
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const validationErrors = validate(data);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            return;
        }

        setErrors({});

        try {
            await mutation.mutateAsync(data);
        } catch {
            // Field/banner state is already set by the mutation's onError.
        }
    };

    return (
        <Shell>
            <Head title={`Seminar Registration · ${seminar.topic}`} />

            {header}
            {submitError && (
                <p className="text-danger-700 mb-4 rounded-md bg-danger-50 px-3 py-2 text-xs">
                    {submitError}
                </p>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Field label="Full name" error={errors.name}>
                    <input
                        className={inputCls}
                        value={data.name}
                        onChange={(e) => setField('name', e.target.value)}
                    />
                </Field>
                <Field label="Email address" error={errors.email}>
                    <input
                        type="email"
                        className={inputCls}
                        value={data.email}
                        onChange={(e) => setField('email', e.target.value)}
                    />
                </Field>
                <Field label="Mobile number" error={errors.mobile}>
                    <input
                        className={inputCls}
                        value={data.mobile}
                        onChange={(e) => setField('mobile', e.target.value)}
                    />
                </Field>
                <Field label="Location / Residence" error={errors.location}>
                    <input
                        className={inputCls}
                        value={data.location}
                        onChange={(e) => setField('location', e.target.value)}
                    />
                </Field>
                <Field label="Profession" error={errors.profession}>
                    <input
                        className={inputCls}
                        value={data.profession}
                        onChange={(e) =>
                            setField('profession', e.target.value)
                        }
                    />
                </Field>
                <Field label="Are you a student?">
                    <select
                        className={inputCls}
                        value={data.is_student ? 'yes' : 'no'}
                        onChange={(e) =>
                            setField('is_student', e.target.value === 'yes')
                        }
                    >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </Field>
                {data.is_student && (
                    <Field label="Student ID" error={errors.student_id}>
                        <input
                            className={inputCls}
                            value={data.student_id}
                            onChange={(e) =>
                                setField('student_id', e.target.value)
                            }
                        />
                    </Field>
                )}

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                >
                    {mutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Submit registration
                </button>
            </form>
        </Shell>
    );
}
