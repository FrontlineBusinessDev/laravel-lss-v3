import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import { traineeService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { Button } from '@/components/Button';
import { TextField, TextAreaField } from '@/components/FormField';
import { RequiredHoursCompletedPill } from '@/components/RatingsBadges';
import { useToast } from '@/hooks/use-toast';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { getHoursProgress } from '@/lib/ratings';
import { router } from '@inertiajs/react';

function Field({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div data-cy="academic-info-tab-div-1">
            <div
                className="flex items-center gap-1.5 text-xs text-neutral-500"
                data-cy="academic-info-tab-div-2"
            >
                {label}
                {hint && (
                    <span
                        className="text-neutral-400"
                        data-cy="academic-info-tab-span-3"
                    >
                        ({hint})
                    </span>
                )}
            </div>
            <div
                className="mt-1 text-sm text-ink"
                data-cy="academic-info-tab-div-4"
            >
                {value || '—'}
            </div>
        </div>
    );
}

type FormState = Pick<
    TraineeDetail,
    'required_hours' | 'date_completed' | 'termination_remarks'
>;

export default function AcademicInfoTab({
    trainee,
}: {
    trainee: TraineeDetail;
}) {
    const { toast } = useToast();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<FormState>({
        required_hours: trainee.required_hours,
        date_completed: trainee.date_completed,
        termination_remarks: trainee.termination_remarks ?? '',
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
                required_hours: draft.required_hours,
                date_completed: draft.date_completed,
                termination_remarks: draft.termination_remarks,
            });
            setSaved(draft);
            setEditing(false);
            toast({
                title: 'Academic information updated',
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
    const hours = getHoursProgress(trainee.completed_hours, saved.required_hours);
    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="academic-info-tab-div-5"
                >
                    <div
                        className="mb-4 flex items-start justify-between gap-3"
                        data-cy="academic-info-tab-div-6"
                    >
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="academic-info-tab-h3-academic-internship-information"
                        >
                            Academic & internship information
                        </h3>
                        {!editing ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={Pencil}
                                onClick={startEdit}
                                data-cy="academic-info-tab-button-start-edit"
                            >
                                Edit
                            </Button>
                        ) : (
                            <div
                                className="flex gap-2"
                                data-cy="academic-info-tab-div-9"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={X}
                                    onClick={cancel}
                                    disabled={saving}
                                    data-cy="academic-info-tab-button-cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={Check}
                                    onClick={save}
                                    disabled={saving}
                                    data-cy="academic-info-tab-button-save"
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        data-cy="academic-info-tab-div-12"
                    >
                        <Field
                            label="School"
                            value={trainee.school?.school_name ?? ''}
                            data-cy="academic-info-tab-field-school"
                        />
                        <Field
                            label="Academic program"
                            value={
                                trainee.batch?.academic_program
                                    ?.course_name ?? ''
                            }
                            data-cy="academic-info-tab-field-academic-program"
                        />
                        <Field
                            label="Academic level"
                            value={
                                trainee.batch?.academic_level
                                    ? `${trainee.batch.academic_level.name} · ${trainee.batch.academic_level.year_level}`
                                    : ''
                            }
                            data-cy="academic-info-tab-field-academic-level"
                        />
                        <Field
                            label="Program type"
                            value={trainee.batch?.setup ?? ''}
                            data-cy="academic-info-tab-field-program-type"
                        />
                        <Field
                            label="Industry"
                            value={trainee.batch?.academic_industry?.name ?? ''}
                            data-cy="academic-info-tab-field-industry"
                        />
                        <Field
                            label="Date started"
                            value={trainee.batch?.date_started ?? ''}
                            hint="from batch"
                            data-cy="academic-info-tab-field-date-started"
                        />
                    </div>

                    {!editing ? (
                        <div
                            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="academic-info-tab-div-12b"
                        >
                            <Field
                                label="Required hours"
                                value={`${hours.required} hrs`}
                                data-cy="academic-info-tab-field-required-hours"
                            />
                            <Field
                                label="Date completed"
                                value={saved.date_completed ?? ''}
                                hint="auto-computed, editable"
                                data-cy="academic-info-tab-field-date-completed"
                            />
                        </div>
                    ) : (
                        <div
                            className="mt-4 grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3"
                            data-cy="academic-info-tab-div-21"
                        >
                            <TextField
                                label="Required hours"
                                type="number"
                                min={0}
                                value={draft.required_hours}
                                onChange={(e) =>
                                    set('required_hours', e.target.value)
                                }
                                data-cy="academic-info-tab-text-field-required-hours"
                            />
                            <TextField
                                label="Date completed"
                                type="date"
                                value={draft.date_completed ?? ''}
                                onChange={(e) =>
                                    set('date_completed', e.target.value)
                                }
                                data-cy="academic-info-tab-text-field-date-completed"
                            />
                            <div
                                className="sm:col-span-2 lg:col-span-3"
                                data-cy="academic-info-tab-div-30"
                            >
                                <TextAreaField
                                    label="Termination remarks"
                                    optional
                                    value={draft.termination_remarks ?? ''}
                                    onChange={(e) =>
                                        set(
                                            'termination_remarks',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Only applies if the trainee was terminated"
                                    data-cy="academic-info-tab-text-area-field-termination-remarks"
                                />
                            </div>
                        </div>
                    )}

                    {saved.termination_remarks && !editing && (
                        <div
                            className="mt-5 rounded-md bg-danger-50 px-3.5 py-3"
                            data-cy="academic-info-tab-div-32"
                        >
                            <div
                                className="text-xs font-medium text-danger-800"
                                data-cy="academic-info-tab-div-termination-remarks"
                            >
                                Termination remarks
                            </div>
                            <p
                                className="mt-1 text-xs leading-relaxed text-danger-800"
                                data-cy="academic-info-tab-p-34"
                            >
                                {saved.termination_remarks}
                            </p>
                        </div>
                    )}

                    <div
                        className="mt-5 border-t border-neutral-100 pt-4"
                        data-cy="academic-info-tab-div-35"
                    >
                        <div
                            className="mb-1.5 text-xs font-medium text-neutral-600"
                            data-cy="academic-info-tab-div-progress"
                        >
                            Progress
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-pill bg-neutral-100"
                            data-cy="academic-info-tab-div-37"
                        >
                            <div
                                className="h-full rounded-pill bg-brand-500"
                                style={{
                                    width: `${hours.percent}%`,
                                }}
                                data-cy="academic-info-tab-div-38"
                            />
                        </div>
                        <div
                            className="mt-1.5 flex items-center gap-2 text-xs text-neutral-500"
                            data-cy="academic-info-tab-div-of"
                        >
                            {hours.completed} of {hours.required} hrs completed
                            {hours.hoursComplete && (
                                <RequiredHoursCompletedPill />
                            )}
                        </div>
                    </div>
                </div>
            </TraineesDetailLayout>
        </>
    );
}
