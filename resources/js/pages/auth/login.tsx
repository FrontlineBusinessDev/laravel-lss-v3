import { FormEvent, useState } from 'react';
import { Link } from '@/lib/router-compat';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
export default function LoginPage({
  status
}: {
  status?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    data,
    setData,
    post,
    processing,
    errors
  } = useForm({
    email: '',
    password: ''
  });
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    post('/login');
  }
  return <AuthLayout data-cy="login-auth-layout-1">
      <h1 className="mb-1 text-xl font-semibold text-ink" data-cy="login-h1-log-in-to-your-account">Log in to your account</h1>
      <p className="mb-6 text-sm text-neutral-500" data-cy="login-p-enter-your-credentials-to-continue">Enter your credentials to continue.</p>

      {status && <div className="mb-4 rounded-md bg-success-50 px-3 py-2 text-center text-xs font-medium text-success-600" data-cy="login-div-4">
          {status}
        </div>}

      <form onSubmit={handleSubmit} data-cy="login-form-submit">
        <div className="mb-4" data-cy="login-div-6">
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="login-label-email">
            Email
          </label>
          <input id="email" type="email" required autoFocus value={data.email} onChange={e => setData('email', e.target.value)} placeholder="name@frontlinebusiness.com.ph" className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="login-input-email" />
          {errors.email && <p className="mt-1 text-xs text-danger-600" data-cy="login-p-9">{errors.email}</p>}
        </div>
        <div className="mb-2" data-cy="login-div-10">
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="login-label-password">
            Password
          </label>
          <div className="relative" data-cy="login-div-12">
            <input id="password" type={showPassword ? 'text' : 'password'} required value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Enter your password" className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 pr-9 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="login-input-enter-your-password" />
            <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600" data-cy="login-button-button">
              {showPassword ? <EyeOff size={16} data-cy="login-eye-off-15" /> : <Eye size={16} data-cy="login-eye-16" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger-600" data-cy="login-p-17">{errors.password}</p>}
        </div>
        <div className="mb-5 text-right" data-cy="login-div-18">
          <Link to="/forgot-password" className="text-xs font-medium text-brand-500 transition-colors hover:text-brand-600" data-cy="login-link-forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={processing} className="w-full h-10 text-sm" data-cy="login-button-submit">
          {processing ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <div className="mt-4 rounded-md bg-neutral-50 px-3 py-2.5 text-center text-xs text-neutral-500" data-cy="login-div-your-role-and-dashboard-are-detected">
        Your role and dashboard are detected automatically after login.
      </div>
    </AuthLayout>;
}