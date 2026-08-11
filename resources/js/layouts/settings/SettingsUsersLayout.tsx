import { Dropdown } from '@/components/Dropdown';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
interface LayoutProps {
    children: ReactNode;
}
const NAV_LINKS = [
    {
        id: 'Users',
        label: 'Users',
        href: '/settings/users',
        permission: 'manage users',
    },
    {
        id: 'Roles',
        label: 'Roles',
        href: '/settings/roles',
        permission: 'manage roles',
    },
] as const;
export default function SettingsUsersLayout({ children }: LayoutProps) {
    const { can } = usePermission(); // Used to permission
    const { url } = usePage(); // Used to automatically highlight the active tab
    // 1. Check access for both targets
    const hasUsersAccess = can('manage users');
    const hasRolesAccess = can('manage roles');
    // 2. Only show the navigation if they can switch between BOTH
    const showNavigation = hasUsersAccess && hasRolesAccess;
    const activeHref =
        NAV_LINKS.find((link) => url.startsWith(link.href))?.href ??
        NAV_LINKS[0].href;
    return (
        <>
            {showNavigation && (
                <>
                    <div
                        className="my-2 hidden flex-wrap gap-1.5 sm:inline-flex"
                        data-cy="settings-users-layout-div-1"
                    >
                        {NAV_LINKS.map((link) => {
                            const isActive = url.startsWith(link.href);
                            return (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className={cn(
                                        'rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97]',
                                        isActive
                                            ? 'bg-brand-500 text-white'
                                            : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
                                    )}
                                    data-cy="settings-users-layout-link-link-href"
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="my-2 sm:hidden">
                        <Dropdown
                            options={NAV_LINKS.map((link) => ({
                                label: link.label,
                                value: link.href,
                            }))}
                            value={activeHref}
                            onChange={(href) => router.visit(href)}
                            variant="pill"
                            data-cy="settings-users-layout-dropdown-mobile"
                        />
                    </div>
                </>
            )}
            {!showNavigation && <div className="h-5" />}
            {children}
        </>
    );
}
