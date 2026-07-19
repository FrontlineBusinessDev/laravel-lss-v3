import { Circle, CircleCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';

const RULES = [
    { key: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
    { key: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
    { key: 'number', label: 'One number', test: (v: string) => /[0-9]/.test(v) },
];

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
    const { showToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const allValid = useMemo(() => RULES.every((r) => r.test(password)), [password]);
    const matches = passwordConfirmation.length > 0 && passwordConfirmation === password;

    const reset = () => {
        setCurrentPassword('');
        setPassword('');
        setPasswordConfirmation('');
        setErrors({});
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!allValid || !matches || !currentPassword) {
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            await apiFetchJson('/user/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: currentPassword,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });
            showToast('Password changed', 'success');
            handleClose();
        } catch (error) {
            if (error instanceof ApiError && error.errors) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(error.errors).map(([k, v]) => [
                            k,
                            Array.isArray(v) ? v[0] : String(v),
                        ]),
                    ),
                );
            }
            showToast(
                error instanceof ApiError ? error.message : 'Failed to change password',
                'error',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} title="Change password">
            <form onSubmit={handleSubmit} data-cy="change-password-modal-form">
                <div className="mb-3.5">
                    <label
                        htmlFor="current_password"
                        className="mb-1.5 block text-xs font-medium text-neutral-600"
                    >
                        Current password
                    </label>
                    <input
                        id="current_password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        data-cy="change-password-modal-input-current-password"
                    />
                    {errors.current_password && (
                        <p className="mt-1.5 text-xs font-medium text-danger-600">
                            {errors.current_password}
                        </p>
                    )}
                </div>

                <div className="mb-3.5">
                    <label
                        htmlFor="new_password"
                        className="mb-1.5 block text-xs font-medium text-neutral-600"
                    >
                        New password
                    </label>
                    <input
                        id="new_password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        data-cy="change-password-modal-input-new-password"
                    />
                </div>

                <div className="mb-3">
                    <label
                        htmlFor="new_password_confirmation"
                        className="mb-1.5 block text-xs font-medium text-neutral-600"
                    >
                        Confirm new password
                    </label>
                    <input
                        id="new_password_confirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        data-cy="change-password-modal-input-confirm-password"
                    />
                </div>

                <div className="mb-5 flex flex-col gap-1.5 rounded-md bg-neutral-50 px-3 py-2.5">
                    {RULES.map((rule) => {
                        const valid = rule.test(password);
                        return (
                            <div
                                key={rule.key}
                                className={cn(
                                    'flex items-center gap-1.5 text-xs transition-colors',
                                    valid ? 'text-success-800' : 'text-neutral-500',
                                )}
                            >
                                {valid ? <CircleCheck size={13} /> : <Circle size={13} />}
                                {rule.label}
                            </div>
                        );
                    })}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="h-10 w-full text-sm"
                    disabled={!allValid || !matches || !currentPassword || submitting}
                    data-cy="change-password-modal-button-submit"
                >
                    {submitting ? 'Changing password…' : 'Change password'}
                </Button>
            </form>
        </Modal>
    );
}
