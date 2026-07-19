import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import TrainerTraineeDetailLayout from '@/layouts/trainees/TrainerTraineeDetailLayout';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <div className="text-xs text-neutral-500">{label}</div>
            <div className="text-sm font-medium text-ink">{value || '—'}</div>
        </div>
    );
}

/** Read-only — trainers view but never edit a trainee's personal info. */
export default function PersonalInfoTab({ trainee }: { trainee: TraineeDetail }) {
    return (
        <TrainerLayout title="Trainee">
            <TrainerTraineeDetailLayout trainee={trainee}>
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="First name" value={trainee.first_name} />
                    <Field label="Last name" value={trainee.last_name} />
                    <Field label="Email" value={trainee.email} />
                    <Field label="Birthday" value={trainee.birthday} />
                    <Field label="Birth place" value={trainee.birth_place} />
                    <Field
                        label="Gender"
                        value={
                            trainee.gender === 'male' ? 'Male' : 'Female'
                        }
                    />
                    <Field label="Mobile number" value={trainee.mobile_number} />
                    <Field label="Landline number" value={trainee.landline_number} />
                    <Field
                        label="Emergency contact"
                        value={trainee.emergency_contact_name}
                    />
                    <Field
                        label="Emergency contact number"
                        value={trainee.emergency_contact_number}
                    />
                    <Field label="Address" value={trainee.address} />
                </div>
            </TrainerTraineeDetailLayout>
        </TrainerLayout>
    );
}
