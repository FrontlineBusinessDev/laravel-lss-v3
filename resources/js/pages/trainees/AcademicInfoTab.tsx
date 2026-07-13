import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';
import type { Trainee } from '@/types';
import { Button } from '@/components/Button';
import { TextField, SelectField, TextAreaField } from '@/components/FormField';
import { partnerSchools, academicPrograms, academicLevels, industries } from '@/data/mockData';
import { PROGRAM_TYPES } from '@/lib/constants';
function Field({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return <div data-cy="academic-info-tab-div-1">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500" data-cy="academic-info-tab-div-2">
        {label}
        {hint && <span className="text-neutral-400" data-cy="academic-info-tab-span-3">({hint})</span>}
      </div>
      <div className="mt-1 text-sm text-ink" data-cy="academic-info-tab-div-4">{value || '—'}</div>
    </div>;
}
type FormState = Pick<Trainee, 'school' | 'academicProgram' | 'academicLevel' | 'programType' | 'industry' | 'requiredHrs' | 'dateStarted' | 'dateCompleted' | 'terminationRemarks'>;
export function AcademicInfoTab({
  trainee
}: {
  trainee: Trainee;
}) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<FormState>({
    school: trainee.school,
    academicProgram: trainee.academicProgram,
    academicLevel: trainee.academicLevel,
    programType: trainee.programType,
    industry: trainee.industry,
    requiredHrs: trainee.requiredHrs,
    dateStarted: trainee.dateStarted,
    dateCompleted: trainee.dateCompleted,
    terminationRemarks: trainee.terminationRemarks ?? ''
  });
  const [draft, setDraft] = useState<FormState>(saved);
  const set = <K extends keyof FormState,>(key: K, value: FormState[K]) => setDraft(d => ({
    ...d,
    [key]: value
  }));
  const schoolOptions = Array.from(new Set([saved.school, ...partnerSchools.filter(s => s.status === 'active').map(s => s.name)]));
  const programOptions = Array.from(new Set([saved.academicProgram, ...academicPrograms.filter(p => p.status === 'active').map(p => p.course)]));
  const levelOptions = Array.from(new Set([saved.academicLevel, ...academicLevels.filter(l => l.status === 'active').map(l => `${l.level} · ${l.yearLevel}`)]));
  const industryOptions = Array.from(new Set([saved.industry, ...industries.filter(i => i.status === 'active').map(i => i.name)]));
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
  return <div className="rounded-lg border border-neutral-200 bg-white p-5" data-cy="academic-info-tab-div-5">
      <div className="mb-4 flex items-start justify-between gap-3" data-cy="academic-info-tab-div-6">
        <h3 className="text-sm font-semibold text-ink" data-cy="academic-info-tab-h3-academic-internship-information">Academic & internship information</h3>
        {!editing ? <Button variant="secondary" size="sm" icon={Pencil} onClick={startEdit} data-cy="academic-info-tab-button-start-edit">
            Edit
          </Button> : <div className="flex gap-2" data-cy="academic-info-tab-div-9">
            <Button variant="secondary" size="sm" icon={X} onClick={cancel} data-cy="academic-info-tab-button-cancel">
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={save} data-cy="academic-info-tab-button-save">
              Save changes
            </Button>
          </div>}
      </div>

      {!editing ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-cy="academic-info-tab-div-12">
          <Field label="School" value={saved.school} data-cy="academic-info-tab-field-school" />
          <Field label="Academic program" value={saved.academicProgram} data-cy="academic-info-tab-field-academic-program" />
          <Field label="Academic level" value={saved.academicLevel} data-cy="academic-info-tab-field-academic-level" />
          <Field label="Program type" value={saved.programType} data-cy="academic-info-tab-field-program-type" />
          <Field label="Industry" value={saved.industry} data-cy="academic-info-tab-field-industry" />
          <Field label="Required hours" value={`${saved.requiredHrs} hrs`} data-cy="academic-info-tab-field-required-hours" />
          <Field label="Date started" value={saved.dateStarted} data-cy="academic-info-tab-field-date-started" />
          <Field label="Date completed" value={saved.dateCompleted} hint="auto-computed, editable" data-cy="academic-info-tab-field-date-completed" />
        </div> : <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3" data-cy="academic-info-tab-div-21">
          <SelectField label="School" options={schoolOptions} value={draft.school} onChange={e => set('school', e.target.value)} data-cy="academic-info-tab-select-field-school" />
          <SelectField label="Academic program" options={programOptions} value={draft.academicProgram} onChange={e => set('academicProgram', e.target.value)} data-cy="academic-info-tab-select-field-academic-program" />
          <SelectField label="Academic level" options={levelOptions} value={draft.academicLevel} onChange={e => set('academicLevel', e.target.value)} data-cy="academic-info-tab-select-field-academic-level" />
          <SelectField label="Program type" options={PROGRAM_TYPES} value={draft.programType} onChange={e => set('programType', e.target.value)} data-cy="academic-info-tab-select-field-program-type" />
          <SelectField label="Industry" options={industryOptions} value={draft.industry} onChange={e => set('industry', e.target.value)} data-cy="academic-info-tab-select-field-industry" />
          <TextField label="Required hours" type="number" min={0} value={draft.requiredHrs} onChange={e => set('requiredHrs', Number(e.target.value))} data-cy="academic-info-tab-text-field-required-hours" />
          <TextField label="Date started" type="date" value={draft.dateStarted} onChange={e => set('dateStarted', e.target.value)} data-cy="academic-info-tab-text-field-date-started" />
          <TextField label="Date completed" type="date" value={draft.dateCompleted} onChange={e => set('dateCompleted', e.target.value)} data-cy="academic-info-tab-text-field-date-completed" />
          <div className="sm:col-span-2 lg:col-span-3" data-cy="academic-info-tab-div-30">
            <TextAreaField label="Termination remarks" optional value={draft.terminationRemarks ?? ''} onChange={e => set('terminationRemarks', e.target.value)} placeholder="Only applies if the trainee was terminated" data-cy="academic-info-tab-text-area-field-termination-remarks" />
          </div>
        </div>}

      {saved.terminationRemarks && !editing && <div className="mt-5 rounded-md bg-danger-50 px-3.5 py-3" data-cy="academic-info-tab-div-32">
          <div className="text-xs font-medium text-danger-800" data-cy="academic-info-tab-div-termination-remarks">Termination remarks</div>
          <p className="mt-1 text-xs leading-relaxed text-danger-800" data-cy="academic-info-tab-p-34">{saved.terminationRemarks}</p>
        </div>}

      <div className="mt-5 border-t border-neutral-100 pt-4" data-cy="academic-info-tab-div-35">
        <div className="mb-1.5 text-xs font-medium text-neutral-600" data-cy="academic-info-tab-div-progress">Progress</div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-neutral-100" data-cy="academic-info-tab-div-37">
          <div className="h-full rounded-pill bg-brand-500" style={{
          width: `${Math.min(100, Math.round(trainee.completedHrs / saved.requiredHrs * 100))}%`
        }} data-cy="academic-info-tab-div-38" />
        </div>
        <div className="mt-1.5 text-xs text-neutral-500" data-cy="academic-info-tab-div-of">
          {trainee.completedHrs} of {saved.requiredHrs} hrs completed
        </div>
      </div>
    </div>;
}