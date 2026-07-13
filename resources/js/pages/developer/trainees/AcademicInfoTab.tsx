import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import type { Trainee } from '@/types'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/FormField'
import { partnerSchools, academicPrograms, academicLevels, industries } from '@/data/mockData'
import { PROGRAM_TYPES } from '@/lib/constants'

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        {label}
        {hint && <span className="text-neutral-400">({hint})</span>}
      </div>
      <div className="mt-1 text-sm text-ink">{value || '—'}</div>
    </div>
  )
}



type FormState = Pick<
  Trainee,
  'school' | 'academicProgram' | 'academicLevel' | 'programType' | 'industry' | 'requiredHrs' | 'dateStarted' | 'dateCompleted' | 'terminationRemarks'
>

export function AcademicInfoTab({ trainee }: { trainee: Trainee }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<FormState>({
    school: trainee.school,
    academicProgram: trainee.academicProgram,
    academicLevel: trainee.academicLevel,
    programType: trainee.programType,
    industry: trainee.industry,
    requiredHrs: trainee.requiredHrs,
    dateStarted: trainee.dateStarted,
    dateCompleted: trainee.dateCompleted,
    terminationRemarks: trainee.terminationRemarks ?? '',
  })
  const [draft, setDraft] = useState<FormState>(saved)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const schoolOptions = Array.from(new Set([saved.school, ...partnerSchools.filter((s) => s.status === 'active').map((s) => s.name)]))
  const programOptions = Array.from(new Set([saved.academicProgram, ...academicPrograms.filter((p) => p.status === 'active').map((p) => p.course)]))
  const levelOptions = Array.from(
    new Set([saved.academicLevel, ...academicLevels.filter((l) => l.status === 'active').map((l) => `${l.level} · ${l.yearLevel}`)]),
  )
  const industryOptions = Array.from(new Set([saved.industry, ...industries.filter((i) => i.status === 'active').map((i) => i.name)]))

  const startEdit = () => {
    setDraft(saved)
    setEditing(true)
  }
  const cancel = () => {
    setDraft(saved)
    setEditing(false)
  }
  const save = () => {
    setSaved(draft)
    setEditing(false)
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Academic & internship information</h3>
        {!editing ? (
          <Button variant="secondary" size="sm" icon={Pencil} onClick={startEdit}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={X} onClick={cancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={save}>
              Save changes
            </Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="School" value={saved.school} />
          <Field label="Academic program" value={saved.academicProgram} />
          <Field label="Academic level" value={saved.academicLevel} />
          <Field label="Program type" value={saved.programType} />
          <Field label="Industry" value={saved.industry} />
          <Field label="Required hours" value={`${saved.requiredHrs} hrs`} />
          <Field label="Date started" value={saved.dateStarted} />
          <Field label="Date completed" value={saved.dateCompleted} hint="auto-computed, editable" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="School" options={schoolOptions} value={draft.school} onChange={(e) => set('school', e.target.value)} />
          <SelectField label="Academic program" options={programOptions} value={draft.academicProgram} onChange={(e) => set('academicProgram', e.target.value)} />
          <SelectField label="Academic level" options={levelOptions} value={draft.academicLevel} onChange={(e) => set('academicLevel', e.target.value)} />
          <SelectField label="Program type" options={PROGRAM_TYPES} value={draft.programType} onChange={(e) => set('programType', e.target.value)} />
          <SelectField label="Industry" options={industryOptions} value={draft.industry} onChange={(e) => set('industry', e.target.value)} />
          <TextField label="Required hours" type="number" min={0} value={draft.requiredHrs} onChange={(e) => set('requiredHrs', Number(e.target.value))} />
          <TextField label="Date started" type="date" value={draft.dateStarted} onChange={(e) => set('dateStarted', e.target.value)} />
          <TextField label="Date completed" type="date" value={draft.dateCompleted} onChange={(e) => set('dateCompleted', e.target.value)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <TextAreaField
              label="Termination remarks"
              optional
              value={draft.terminationRemarks ?? ''}
              onChange={(e) => set('terminationRemarks', e.target.value)}
              placeholder="Only applies if the trainee was terminated"
            />
          </div>
        </div>
      )}

      {saved.terminationRemarks && !editing && (
        <div className="mt-5 rounded-md bg-danger-50 px-3.5 py-3">
          <div className="text-xs font-medium text-danger-800">Termination remarks</div>
          <p className="mt-1 text-xs leading-relaxed text-danger-800">{saved.terminationRemarks}</p>
        </div>
      )}

      <div className="mt-5 border-t border-neutral-100 pt-4">
        <div className="mb-1.5 text-xs font-medium text-neutral-600">Progress</div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-neutral-100">
          <div
            className="h-full rounded-pill bg-brand-500"
            style={{ width: `${Math.min(100, Math.round((trainee.completedHrs / saved.requiredHrs) * 100))}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-neutral-500">
          {trainee.completedHrs} of {saved.requiredHrs} hrs completed
        </div>
      </div>
    </div>
  )
}
