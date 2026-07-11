import { useForm } from '@inertiajs/react'
import { FormEvent, useMemo } from 'react'
import { Lock, Circle, CircleCheck } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'

const RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number', test: (v: string) => /[0-9]/.test(v) },
]

interface ResetPasswordProps {
  token: string
  email: string
}

export default function ResetPasswordPage({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors } = useForm({
    email: email ?? '',
    password: '',
    password_confirmation: '',
  })

  const allValid = useMemo(() => RULES.every((r) => r.test(data.password)), [data.password])
  const matches = data.password_confirmation.length > 0 && data.password_confirmation === data.password

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!allValid || !matches) return
    post(`/invitation/${token}`)
  }

  return (
    <AuthLayout>
      <div className="mb-4 flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
          <Lock size={20} className="text-brand-700" />
        </div>
      </div>

      <h1 className="mb-1 text-center text-xl font-semibold text-ink">Set a new password</h1>
      <p className="mb-5 text-center text-sm leading-relaxed text-neutral-500">
        Resetting for <span className="font-medium text-ink">{data.email}</span>
      </p>

      <form onSubmit={handleSubmit}>
        {errors.email && <p className="mb-3 text-center text-xs font-medium text-danger-600">{errors.email}</p>}

        <div className="mb-3.5">
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-neutral-600">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            placeholder="Enter new password"
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.password && <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.password}</p>}
        </div>
        <div className="mb-3">
          <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-neutral-600">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            placeholder="Re-enter new password"
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="mb-5 flex flex-col gap-1.5 rounded-md bg-neutral-50 px-3 py-2.5">
          {RULES.map((rule) => {
            const valid = rule.test(data.password)
            return (
              <div
                key={rule.key}
                className={cn('flex items-center gap-1.5 text-xs transition-colors', valid ? 'text-success-800' : 'text-neutral-500')}
              >
                {valid ? <CircleCheck size={13} /> : <Circle size={13} />}
                {rule.label}
              </div>
            )
          })}
        </div>

        <Button type="submit" variant="primary" className="w-full h-10 text-sm" disabled={!allValid || !matches || processing}>
          {processing ? 'Setting password…' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
