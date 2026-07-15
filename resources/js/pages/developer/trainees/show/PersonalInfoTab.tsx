import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import type { Trainee } from '@/types';
import { Button } from '@/components/Button';
import { TextField, SelectField } from '@/components/FormField';
import { AppTrainees } from '@/types/modules/trainees/trainees';

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
    AppTrainees,
    | 'first_name'
    | 'last_name'
    | 'email'
    | 'birthDate'
    | 'birthPlace'
    | 'gender'
    | 'mobileNumber'
    | 'landlineNumber'
    | 'emergencyContactName'
    | 'emergencyContactNumber'
    | 'address'
>;

interface Props {
    record: AppTrainees;
    initals: string;
}

export default function PersonalInfoTab({ record, initals }: Props) {
    // export default function PersonalInfoTab(props: any) {
    // console.log(props);
    const trainee = record;
    console.log(trainee);
    console.log(initals);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState<FormState>({
        first_name: trainee.first_name,
        last_name: trainee.last_name,
        email: trainee.email,
        birthDate: trainee.birthDate,
        birthPlace: trainee.birthPlace,
        gender: trainee.gender,
        mobileNumber: trainee.mobileNumber,
        landlineNumber: trainee?.landlineNumber ?? '',
        emergencyContactName: trainee.emergencyContactName,
        emergencyContactNumber: trainee.emergencyContactNumber,
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
    const save = () => {
        setSaved(draft);
        setEditing(false);
    };

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-5"
            data-cy="personal-info-tab-div-4"
        >
            <div
                className="mb-5 flex items-start justify-between gap-3"
                data-cy="personal-info-tab-div-5"
            >
                <div
                    className="flex items-center gap-3"
                    data-cy="personal-info-tab-div-6"
                >
                    <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700"
                        data-cy="personal-info-tab-div-7"
                    >
                        {trainee.initials}
                    </div>
                    <div data-cy="personal-info-tab-div-8">
                        <div
                            className="text-sm font-semibold text-ink"
                            data-cy="personal-info-tab-div-9"
                        >
                            {saved.name}
                        </div>
                        <div
                            className="text-xs text-neutral-500"
                            data-cy="personal-info-tab-div-10"
                        >
                            {saved.email}
                        </div>
                    </div>
                </div>
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
                            data-cy="personal-info-tab-button-cancel"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Check}
                            onClick={save}
                            data-cy="personal-info-tab-button-save"
                        >
                            Save changes
                        </Button>
                    </div>
                )}
            </div>

            {!editing ? (
                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    data-cy="personal-info-tab-div-15"
                >
                    <Field
                        label="Full name"
                        value={saved.name}
                        data-cy="personal-info-tab-field-full-name"
                    />
                    <Field
                        label="Email address"
                        value={saved.email}
                        data-cy="personal-info-tab-field-email-address"
                    />
                    <Field
                        label="Birth date"
                        value={saved.birthDate}
                        data-cy="personal-info-tab-field-birth-date"
                    />
                    <Field
                        label="Birth place"
                        value={saved.birthPlace}
                        data-cy="personal-info-tab-field-birth-place"
                    />
                    <Field
                        label="Gender"
                        value={saved.gender}
                        data-cy="personal-info-tab-field-gender"
                    />
                    <Field
                        label="Mobile number"
                        value={saved.mobileNumber}
                        data-cy="personal-info-tab-field-mobile-number"
                    />
                    <Field
                        label="Landline number"
                        value={saved.landlineNumber ?? ''}
                        data-cy="personal-info-tab-field-landline-number"
                    />
                    <Field
                        label="Emergency contact name"
                        value={saved.emergencyContactName}
                        data-cy="personal-info-tab-field-emergency-contact-name"
                    />
                    <Field
                        label="Emergency contact number"
                        value={saved.emergencyContactNumber}
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
                        label="Full name"
                        value={draft.name}
                        onChange={(e) => set('name', e.target.value)}
                        data-cy="personal-info-tab-text-field-full-name"
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
                        value={draft.birthDate}
                        onChange={(e) => set('birthDate', e.target.value)}
                        data-cy="personal-info-tab-text-field-birth-date"
                    />
                    <TextField
                        label="Birth place"
                        value={draft.birthPlace}
                        onChange={(e) => set('birthPlace', e.target.value)}
                        data-cy="personal-info-tab-text-field-birth-place"
                    />
                    <SelectField
                        label="Gender"
                        options={['Male', 'Female', 'Other']}
                        value={draft.gender}
                        onChange={(e) =>
                            set('gender', e.target.value as Trainee['gender'])
                        }
                        data-cy="personal-info-tab-select-field-gender"
                    />
                    <TextField
                        label="Mobile number"
                        value={draft.mobileNumber}
                        onChange={(e) => set('mobileNumber', e.target.value)}
                        data-cy="personal-info-tab-text-field-mobile-number"
                    />
                    <TextField
                        label="Landline number"
                        optional
                        value={draft.landlineNumber ?? ''}
                        onChange={(e) => set('landlineNumber', e.target.value)}
                        data-cy="personal-info-tab-text-field-landline-number"
                    />
                    <TextField
                        label="Emergency contact name"
                        value={draft.emergencyContactName}
                        onChange={(e) =>
                            set('emergencyContactName', e.target.value)
                        }
                        data-cy="personal-info-tab-text-field-emergency-contact-name"
                    />
                    <TextField
                        label="Emergency contact number"
                        value={draft.emergencyContactNumber}
                        onChange={(e) =>
                            set('emergencyContactNumber', e.target.value)
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
                            onChange={(e) => set('address', e.target.value)}
                            data-cy="personal-info-tab-text-field-address"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
