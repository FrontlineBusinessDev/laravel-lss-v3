import { FormEvent, useState } from 'react'
import { Link } from '@/lib/router-compat'
import { Mail, ArrowLeft, CircleCheck } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/Button'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <AuthLayout>
      <div className="mb-4 flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
          {sent ? <CircleCheck size={20} className="text-success-800" /> : <Mail size={20} className="text-brand-700" />}
        </div>
      </div>

      {!sent ? (
        <>
          <h1 className="mb-1 text-center text-xl font-semibold text-ink">Forgot your password?</h1>
          <p className="mb-6 text-center text-sm leading-relaxed text-neutral-500">
            Enter the email linked to your account and we'll send you a link to reset it.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-neutral-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@frontlinebusiness.com.ph"
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full h-10 text-sm">
              Send reset link
            </Button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mb-1 text-center text-xl font-semibold text-ink">Check your email</h1>
          <p className="mb-2 text-center text-sm leading-relaxed text-neutral-500">
            We sent a password reset link to your inbox. It expires in 30 minutes.
          </p>
        </>
      )}

      <div className="mt-4 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft size={13} />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
