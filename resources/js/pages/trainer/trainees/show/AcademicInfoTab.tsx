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

/** Read-only — trainers view but never edit a trainee's academic info. */
export default function AcademicInfoTab({ trainee }: { trainee: TraineeDetail }) {
    return (
        <TrainerLayout title="Trainee">
            <TrainerTraineeDetailLayout trainee={trainee}>
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Batch" value={trainee.batch?.batch_code} />
                    <Field label="School" value={trainee.school?.school_name} />
                    <Field
                        label="Program"
                        value={trainee.batch?.academic_program?.name}
                    />
                    <Field
                        label="Industry"
                        value={trainee.batch?.academic_industry?.name}
                    />
                    <Field
                        label="Level"
                        value={trainee.batch?.academic_level?.name}
                    />
                    <Field
                        label="Setup"
                        value={trainee.batch?.setup === 'F2F' ? 'Face to Face' : 'Online'}
                    />
                    <Field
                        label="Required hours"
                        value={trainee.required_hours ? `${trainee.required_hours} hrs` : null}
                    />
                    <Field
                        label="Completed hours"
                        value={trainee.completed_hours ? `${trainee.completed_hours} hrs` : null}
                    />
                    <Field label="Date completed" value={trainee.date_completed} />
                </div>
            </TrainerTraineeDetailLayout>
        </TrainerLayout>
    );
}
