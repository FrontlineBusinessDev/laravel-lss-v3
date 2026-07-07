import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, SelectField, InfoNote } from '@/components/FormField'
import type { AppUser } from '@/types'

const ROLES = ['Administrator', 'Program coordinator', 'Trainer', 'Finance']

export interface UserFormValues {
  name: string
  email: string
  mobileNumber: string
  role: AppUser['role']
}

interface AddUserModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: UserFormValues) => void
  initial?: AppUser | null
}

const EMPTY: UserFormValues = { name: '', email: '', mobileNumber: '', role: 'Program coordinator' }

export function AddUserModal({ open, onClose, onSave, initial }: AddUserModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<UserFormValues>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})

  useEffect(() => {
    if (open) {
      setValues(
        initial
          ? { name: initial.name, email: initial.email, mobileNumber: initial.mobileNumber ?? '', role: initial.role }
          : EMPTY,
      )
      setErrors({})
    }
  }, [open, initial])

  function set<K extends keyof UserFormValues>(key: K, val: UserFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const next: typeof errors = {}
    if (!values.name.trim()) next.name = 'Full name is required.'
    if (!values.email.trim()) next.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave(values)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'Add user'}
      description={isEdit ? 'Update this staff member\u2019s details and role.' : 'Staff accounts get a setup email. Trainee accounts are created automatically on registration.'}
    >
      <TextField
        label="Full name"
        placeholder="Juan Dela Cruz"
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
      />
      {errors.name && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.name}</p>}

      <TextField
        label="Email address"
        type="email"
        placeholder="name@frontlinebusiness.com.ph"
        value={values.email}
        onChange={(e) => set('email', e.target.value)}
        disabled={isEdit}
      />
      {errors.email && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.email}</p>}

      <SelectField
        label="Role"
        options={ROLES}
        value={values.role}
        onChange={(e) => set('role', e.target.value as AppUser['role'])}
      />
      <TextField
        label="Mobile number"
        optional
        placeholder="+63 9XX XXX XXXX"
        value={values.mobileNumber}
        onChange={(e) => set('mobileNumber', e.target.value)}
      />

      {!isEdit && (
        <InfoNote>
          <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
          An account setup email with a password link will be sent once this user is added.
        </InfoNote>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add user'}
        </Button>
      </div>
    </Modal>
  )
}
