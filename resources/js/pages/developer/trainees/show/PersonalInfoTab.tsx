import { traineeService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { SelectField, TextField } from '@/components/FormField';
import { useToast } from '@/hooks/use-toast';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { router } from '@inertiajs/react';
import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

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

type FormState = Pick<
    TraineeDetail,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'birthday'
    | 'birth_place'
    | 'gender'
    | 'mobile_number'
    | 'landline_number'
    | 'emergency_contact_name'
    | 'emergency_contact_number'
    | 'address'
>;

interface Props {
    trainee: TraineeDetail;
}

export default function PersonalInfoTab({ trainee }: Props) {
    const { toast } = useToast();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<FormState>({
        first_name: trainee.first_name,
        last_name: trainee.last_name,
        email: trainee.email,
        birthday: trainee.birthday,
        birth_place: trainee.birth_place,
        gender: trainee.gender,
        mobile_number: trainee.mobile_number,
        landline_number: trainee.landline_number ?? '',
        emergency_contact_name: trainee.emergency_contact_name,
        emergency_contact_number: trainee.emergency_contact_number,
        address: trainee.address,
    });
    const [draft, setDraft] = useState<FormState>(saved);
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setDraft((d) => ({
            ...d,
            [key]: value,
        }));
    const startEdit = () => {
        setDraft(saved);
        setEditing(true);
    };
    const cancel = () => {
        setDraft(saved);
        setEditing(false);
    };
    const save = async () => {
        setSaving(true);
        try {
            await traineeService.update(trainee.id, {
                ...trainee,
                ...draft,
            });
            setSaved(draft);
            setEditing(false);
            toast({
                title: 'Personal information updated',
                variant: 'success',
            });
            router.reload({ only: ['trainee'] });
        } catch (error) {
            toast({
                title: 'Failed to save changes',
                description:
                    error instanceof ApiError ? error.message : undefined,
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <TraineesDetailLayout trainee={trainee}>
            <div
                className="rounded-lg border border-neutral-200 bg-white p-5"
                data-cy="personal-info-tab-div-4"
            >
                <div className="grid grid-cols-[1fr_70px] gap-2">
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
                                value={saved.birthday}
                                data-cy="personal-info-tab-field-birth-date"
                            />
                            <Field
                                label="Birth place"
                                value={saved.birth_place}
                                data-cy="personal-info-tab-field-birth-place"
                            />
                            <Field
                                label="Gender"
                                value={saved.gender}
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
                        <div
                            className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="personal-info-tab-div-27"
                        >
                            <TextField
                                label="First name"
                                value={draft.first_name}
                                onChange={(e) =>
                                    set('first_name', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-first-name"
                            />
                            <TextField
                                label="Last name"
                                value={draft.last_name}
                                onChange={(e) =>
                                    set('last_name', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-last-name"
                            />
                            <TextField
                                label="Email address"
                                type="email"
                                value={draft.email}
                                onChange={(e) => set('email', e.target.value)}
                                data-cy="personal-info-tab-text-field-email-address"
                            />
                            <TextField
                                label="Birth date"
                                type="date"
                                value={draft.birthday}
                                onChange={(e) =>
                                    set('birthday', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-birth-date"
                            />
                            <TextField
                                label="Birth place"
                                value={draft.birth_place}
                                onChange={(e) =>
                                    set('birth_place', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-birth-place"
                            />
                            <SelectField
                                label="Gender"
                                options={['male', 'female']}
                                value={draft.gender}
                                onChange={(e) =>
                                    set(
                                        'gender',
                                        e.target
                                            .value as TraineeDetail['gender'],
                                    )
                                }
                                data-cy="personal-info-tab-select-field-gender"
                            />
                            <TextField
                                label="Mobile number"
                                value={draft.mobile_number}
                                onChange={(e) =>
                                    set('mobile_number', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-mobile-number"
                            />
                            <TextField
                                label="Landline number"
                                optional
                                value={draft.landline_number ?? ''}
                                onChange={(e) =>
                                    set('landline_number', e.target.value)
                                }
                                data-cy="personal-info-tab-text-field-landline-number"
                            />
                            <TextField
                                label="Emergency contact name"
                                value={draft.emergency_contact_name}
                                onChange={(e) =>
                                    set(
                                        'emergency_contact_name',
                                        e.target.value,
                                    )
                                }
                                data-cy="personal-info-tab-text-field-emergency-contact-name"
                            />
                            <TextField
                                label="Emergency contact number"
                                value={draft.emergency_contact_number}
                                onChange={(e) =>
                                    set(
                                        'emergency_contact_number',
                                        e.target.value,
                                    )
                                }
                                data-cy="personal-info-tab-text-field-emergency-contact-number"
                            />
                            <div
                                className="sm:col-span-2 lg:col-span-3"
                                data-cy="personal-info-tab-div-37"
                            >
                                <TextField
                                    label="Address"
                                    value={draft.address}
                                    onChange={(e) =>
                                        set('address', e.target.value)
                                    }
                                    data-cy="personal-info-tab-text-field-address"
                                />
                            </div>
                        </div>
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
                            className="flex gap-2"
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
                                icon={Check}
                                onClick={save}
                                disabled={saving}
                                data-cy="personal-info-tab-button-save"
                            >
                                {saving ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </TraineesDetailLayout>
    );
}
