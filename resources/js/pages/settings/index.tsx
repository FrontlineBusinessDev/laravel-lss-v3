import { ErrorFallback } from '@/components/ErrorFallBack';
import { usePermission } from '@/hooks/use-permissions';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
export default function index() {
  const {
    can
  } = usePermission();
  // 1. Define the preference hierarchy for redirection
  const targets = [{
    permission: 'manage users',
    href: '/settings/users'
  }, {
    permission: 'manage settings partner schools',
    href: '/settings/partner-schools'
  }, {
    permission: 'manage settings academic',
    href: '/settings/academic'
  }];

  // 2. Find the first module the user actually has access to
  const fallbackTarget = targets.find(target => can(target.permission));
  useEffect(() => {
    // 3. If a valid destination is found, redirect them immediately
    if (fallbackTarget) {
      router.visit(fallbackTarget.href, {
        replace: true
      });
    }
  }, [fallbackTarget]);

  // 4. If no permissions match, break the chain and show your 404 / Access Denied UI
  if (!fallbackTarget) {
    return <ErrorFallback status="403" title="Access Denied" description="You don't have permission to manage any configuration modules under Settings." data-cy="index-error-fallback-access-denied" />;
  }

  // Return a blank loading state while the useEffect redirect kicks in
  return null;
  // return <AcademicTab />;
}