import { Link } from '@inertiajs/react';
interface ErrorFallbackProps {
  status?: string | number;
  title?: string;
  description?: string;
  backToHref?: string;
  backToLabel?: string;
}
export function ErrorFallback({
  status = '404',
  title = 'Page not found',
  description = 'Sorry, the page you are looking for does not exist or you do not have permission to view it.',
  backToHref = '/dashboard',
  backToLabel = 'Back to Dashboard'
}: ErrorFallbackProps) {
  return <div className="flex h-[60vh] w-full flex-col items-center justify-center p-4 text-center" data-cy="error-fall-back-div-1">
            <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900" data-cy="error-fall-back-h1-2">
                {status}
            </h1>
            <h2 className="mt-2 text-lg font-semibold text-neutral-800" data-cy="error-fall-back-h2-3">
                {title}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-500" data-cy="error-fall-back-p-4">
                {description}
            </p>
            <Link href={backToHref} className="mt-6 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600" data-cy="error-fall-back-link-back-to-href">
                {backToLabel}
            </Link>
        </div>;
}