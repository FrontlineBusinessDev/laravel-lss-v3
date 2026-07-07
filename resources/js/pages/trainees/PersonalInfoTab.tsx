import { useState } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import type { Trainee } from '@/types'
import { Button } from '@/components/Button'
import { TextField, SelectField } from '@/components/FormField'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-sm text-ink">{value || '—'}</div>
    </div>
  )
}

type FormState = Pick<
  Trainee,
  'name' | 'email' | 'birthDate' | 'birthPlace' | 'gender' | 'mobileNumber' | 'landlineNumber' | 'emergencyContactName' | 'emergencyContactNumber' | 'address'
>

export function PersonalInfoTab({ trainee }: { trainee: Trainee }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<FormState>({
    name: trainee.name,
    email: trainee.email,
    birthDate: trainee.birthDate,
    birthPlace: trainee.birthPlace,
    gender: trainee.gender,
    mobileNumber: trainee.mobileNumber,
    landlineNumber: trainee.landlineNumber ?? '',
    emergencyContactName: trainee.emergencyContactName,
    emergencyContactNumber: trainee.emergencyContactNumber,
    address: trainee.address,
  })
  const [draft, setDraft] = useState<FormState>(saved)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setDraft((d) => ({ ...d, [key]: value }))

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
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-semibold text-brand-700">
            {trainee.initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">{saved.name}</div>
            <div className="text-xs text-neutral-500">{saved.email}</div>
          </div>
        </div>
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
          <Field label="Full name" value={saved.name} />
          <Field label="Email address" value={saved.email} />
          <Field label="Birth date" value={saved.birthDate} />
          <Field label="Birth place" value={saved.birthPlace} />
          <Field label="Gender" value={saved.gender} />
          <Field label="Mobile number" value={saved.mobileNumber} />
          <Field label="Landline number" value={saved.landlineNumber ?? ''} />
          <Field label="Emergency contact name" value={saved.emergencyContactName} />
          <Field label="Emergency contact number" value={saved.emergencyContactNumber} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Address" value={saved.address} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Full name" value={draft.name} onChange={(e) => set('name', e.target.value)} />
          <TextField label="Email address" type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} />
          <TextField label="Birth date" type="date" value={draft.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          <TextField label="Birth place" value={draft.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} />
          <SelectField label="Gender" options={['Male', 'Female', 'Other']} value={draft.gender} onChange={(e) => set('gender', e.target.value as Trainee['gender'])} />
          <TextField label="Mobile number" value={draft.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} />
          <TextField label="Landline number" optional value={draft.landlineNumber ?? ''} onChange={(e) => set('landlineNumber', e.target.value)} />
          <TextField label="Emergency contact name" value={draft.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
          <TextField label="Emergency contact number" value={draft.emergencyContactNumber} onChange={(e) => set('emergencyContactNumber', e.target.value)} />
          <div className="sm:col-span-2 lg:col-span-3">
            <TextField label="Address" value={draft.address} onChange={(e) => set('address', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}
