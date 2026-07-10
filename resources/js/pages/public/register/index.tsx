import type { ReactNode } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';

interface PublicBatch {
    batch_code: string;
    setup: 'f2f' | 'online';
    status: string;
    date_started: string | null;
    industry: string | null;
    level: string | null;
    program: string | null;
}

interface School {
    id: number;
    name: string;
}

interface RegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    birth_place: string;
    gender: string;
    mobile_number: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    school_id: string;
    required_hours: string;
    resume: File | null;
    endorsement_letter: File | null;
    moa: File | null;
    liability_waiver: File | null;
}

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
            {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
        </div>
    );
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                {children}
            </div>
        </div>
    );
}

export default function PublicRegisterPage({
    token,
    batch,
    schools,
}: {
    token: string;
    batch: PublicBatch;
    schools: School[];
}) {
    const flash = usePage().props.flash as
        | { success?: string; error?: string }
        | undefined;

    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
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
    });

    // Success screen after a completed submission (flash set on the redirect).
    if (flash?.success) {
        return (
            <Shell>
                <div className="flex flex-col items-center py-6 text-center">
                    <CheckCircle2 className="mb-3 h-12 w-12 text-success-600" />
                    <h1 className="text-xl font-semibold text-ink">
                        Registration received
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-neutral-500">
                        {flash.success}
                    </p>
                    <p className="mt-1 font-mono text-xs text-neutral-400">
                        {batch.batch_code}
                    </p>
                </div>
            </Shell>
        );
    }

    const header = (
        <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-ink">Batch Registration</h1>
            <p className="mt-1 text-sm text-neutral-500">
                {batch.batch_code} · {batch.program ?? '—'} ·{' '}
                {batch.setup === 'f2f' ? 'Face to Face' : 'Online'}
            </p>
        </div>
    );

    // Registration closed unless the batch is active.
    if (batch.status !== 'active') {
        return (
            <Shell>
                {header}
                <p className="rounded-lg bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                    Registration for this batch is currently closed.
                </p>
            </Shell>
        );
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/register/${token}`, { forceFormData: true, preserveScroll: true });
    };

    const fileInput = (key: keyof RegisterForm) => (
        <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setData(key, e.target.files?.[0] ?? null)}
            className="w-full text-xs text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
        />
    );

    return (
        <Shell>
            {header}
            {flash?.error && (
                <p className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-xs text-danger-700">
                    {flash.error}
                </p>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First name" error={errors.first_name}>
                        <input className={inputCls} value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                    </Field>
                    <Field label="Last name" error={errors.last_name}>
                        <input className={inputCls} value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                        <input type="email" className={inputCls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </Field>
                    <Field label="Mobile number" error={errors.mobile_number}>
                        <input className={inputCls} value={data.mobile_number} onChange={(e) => setData('mobile_number', e.target.value)} />
                    </Field>
                    <Field label="Date of birth" error={errors.birthday}>
                        <input type="date" className={inputCls} value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} />
                    </Field>
                    <Field label="Place of birth" error={errors.birth_place}>
                        <input className={inputCls} value={data.birth_place} onChange={(e) => setData('birth_place', e.target.value)} />
                    </Field>
                    <Field label="Gender" error={errors.gender}>
                        <select className={inputCls} value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                            <option value="" disabled>Select gender…</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </Field>
                    <Field label="Required hours" error={errors.required_hours}>
                        <input type="number" step="0.01" min="0" className={inputCls} value={data.required_hours} onChange={(e) => setData('required_hours', e.target.value)} />
                    </Field>
                    <Field label="Partner school" error={errors.school_id}>
                        <select className={inputCls} value={data.school_id} onChange={(e) => setData('school_id', e.target.value)}>
                            <option value="" disabled>Select school…</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Complete address" error={errors.address}>
                    <textarea rows={2} className={`${inputCls} h-auto resize-none py-2`} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Emergency contact name" error={errors.emergency_contact_name}>
                        <input className={inputCls} value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} />
                    </Field>
                    <Field label="Emergency contact number" error={errors.emergency_contact_number}>
                        <input className={inputCls} value={data.emergency_contact_number} onChange={(e) => setData('emergency_contact_number', e.target.value)} />
                    </Field>
                </div>

                <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs font-semibold text-neutral-600">Documents</p>
                    <Field label="Resume / CV" error={errors.resume}>{fileInput('resume')}</Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="Endorsement letter" optional error={errors.endorsement_letter}>{fileInput('endorsement_letter')}</Field>
                        <Field label="MOA" optional error={errors.moa}>{fileInput('moa')}</Field>
                        <Field label="Liability waiver" optional error={errors.liability_waiver}>{fileInput('liability_waiver')}</Field>
                    </div>
                    <p className="text-xs text-neutral-400">Accepted: PDF, DOC/DOCX, JPG, PNG (max 5&nbsp;MB each).</p>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-500/90 disabled:opacity-60"
                >
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit registration
                </button>
            </form>
        </Shell>
    );
}
