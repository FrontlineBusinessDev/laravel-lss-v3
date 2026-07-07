import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Building2, Upload, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, TextAreaField } from '@/components/FormField'
import type { PartnerSchool } from '@/types'

export interface SchoolFormValues {
  name: string
  abbr: string
  contactPerson: string
  email: string
  address: string
  logoUrl?: string
}

interface AddSchoolModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: SchoolFormValues) => void
  initial?: PartnerSchool | null
}

const EMPTY: SchoolFormValues = { name: '', abbr: '', contactPerson: '', email: '', address: '', logoUrl: undefined }

export function AddSchoolModal({ open, onClose, onSave, initial }: AddSchoolModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<SchoolFormValues>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof SchoolFormValues, string>>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValues(
        initial
          ? {
              name: initial.name,
              abbr: initial.abbr,
              contactPerson: initial.contactPerson,
              email: initial.email,
              address: initial.address,
              logoUrl: initial.logoUrl,
            }
          : EMPTY,
      )
      setErrors({})
    }
  }, [open, initial])

  function set<K extends keyof SchoolFormValues>(key: K, val: SchoolFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => set('logoUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  function validate() {
    const next: typeof errors = {}
    if (!values.name.trim()) next.name = 'School name is required.'
    if (!values.abbr.trim()) next.abbr = 'Abbreviation is required.'
    if (!values.contactPerson.trim()) next.contactPerson = 'Contact person is required.'
    if (!values.email.trim()) next.email = 'Contact email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (!values.address.trim()) next.address = 'Address is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit partner school' : 'Add partner school'}>
      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          School logo <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            {values.logoUrl ? (
              <img src={values.logoUrl} alt="School logo preview" className="h-full w-full object-cover" />
            ) : (
              <Building2 size={20} className="text-neutral-300" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoPick} />
          <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>
            Upload logo
          </Button>
          {values.logoUrl && (
            <button
              type="button"
              onClick={() => set('logoUrl', undefined)}
              aria-label="Remove logo"
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-danger-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <TextField label="School name" placeholder="e.g. STI College" value={values.name} onChange={(e) => set('name', e.target.value)} />
      {errors.name && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.name}</p>}

      <TextField label="Abbreviation" placeholder="e.g. STI" value={values.abbr} onChange={(e) => set('abbr', e.target.value)} />
      {errors.abbr && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.abbr}</p>}

      <TextField label="Contact person" placeholder="Full name" value={values.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
      {errors.contactPerson && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.contactPerson}</p>}

      <TextField label="Contact email" type="email" placeholder="name@school.edu.ph" value={values.email} onChange={(e) => set('email', e.target.value)} />
      {errors.email && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.email}</p>}

      <TextAreaField label="Physical address" placeholder="Building, street, city" value={values.address} onChange={(e) => set('address', e.target.value)} />
      {errors.address && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.address}</p>}

      <div className="mt-1.5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add school'}
        </Button>
      </div>
    </Modal>
  )
}
