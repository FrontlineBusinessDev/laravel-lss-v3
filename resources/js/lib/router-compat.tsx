/**
 * Thin react-router-dom-compatible shim backed by Inertia.
 *
 * The lss-admin frontend was originally built with react-router-dom.
 * Laravel + Inertia does routing on the server (see routes/web.php), so
 * instead of rewriting every page/component we provide drop-in
 * replacements for the handful of react-router hooks/components actually
 * used (Link, NavLink, useNavigate, useParams, useSearchParams).
 *
 * Import this from '@/lib/router-compat' instead of 'react-router-dom'.
 */
import { Link as InertiaLink, router, usePage } from '@inertiajs/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children?: ReactNode;
  replace?: boolean;
};
export function Link({
  to,
  replace,
  children,
  ...rest
}: LinkProps) {
  return <InertiaLink href={to} replace={replace} {...rest} data-cy="router-compat-inertia-link-to">
            {children}
        </InertiaLink>;
}
type NavLinkProps = Omit<LinkProps, 'className'> & {
  className?: string | ((state: {
    isActive: boolean;
  }) => string);
  end?: boolean;
};
export function NavLink({
  to,
  className,
  children,
  end,
  ...rest
}: NavLinkProps) {
  const {
    url
  } = usePage();
  const currentPath = url.split('?')[0];
  const targetPath = to.split('?')[0];
  const isActive = end ? currentPath === targetPath : currentPath.startsWith(targetPath);
  const resolvedClassName = typeof className === 'function' ? className({
    isActive
  }) : className;
  return <InertiaLink href={to} className={resolvedClassName} {...rest} data-cy="router-compat-inertia-link-to-2">
            {children}
        </InertiaLink>;
}

/**
 * Matches react-router's `useNavigate()` signature closely enough for this
 * codebase: `navigate('/path')` and `navigate('/path', { replace: true })`.
 */
export function useNavigate() {
  return (to: string, options?: {
    replace?: boolean;
  }) => {
    router.visit(to, {
      replace: options?.replace,
      preserveScroll: true
    });
  };
}

/**
 * react-router's useParams() reads named segments from the matched route
 * pattern. There's no client-side route table here, so this covers the
 * one shape this app actually needs: a numeric/string id as the final URL
 * segment (e.g. /batches/:id, /trainees/:id).
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): Partial<T> {
  const {
    url
  } = usePage();
  const path = url.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  const id = segments[segments.length - 1];
  return {
    id
  } as Partial<T>;
}

/**
 * react-router's useSearchParams(), backed by the current Inertia URL.
 * The setter updates the query string via a client-side visit.
 */
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void] {
  const {
    url
  } = usePage();
  const query = url.split('?')[1] ?? '';
  const searchParams = new URLSearchParams(query);
  const setSearchParams = (params: URLSearchParams | Record<string, string>) => {
    const next = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const path = url.split('?')[0];
    const qs = next.toString();
    router.visit(qs ? `${path}?${qs}` : path, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  return [searchParams, setSearchParams];
}

/** react-router's <Navigate/> equivalent — visits on render. */
export function Navigate({
  to,
  replace
}: {
  to: string;
  replace?: boolean;
}) {
  router.visit(to, {
    replace
  });
  return null;
}