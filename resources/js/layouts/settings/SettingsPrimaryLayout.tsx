import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Dropdown } from '@/components/Dropdown';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
    actionNode?: ReactNode;
}

const NAV_LINKS = [
    {
        id: 'Users',
        label: 'Users',
        href: '/settings/users',
        permission: 'manage users',
    },
    {
        id: 'Partner schools',
        label: 'Partner Schools',
        href: '/settings/partner-schools',
        permission: 'manage settings partner schools',
    },
    {
        id: 'Academic',
        label: 'Academic',
        href: '/settings/academic',
        permission: 'manage settings academic',
    },
    {
        id: 'Rates',
        label: 'Rates',
        href: '/settings/rates',
        permission: 'manage settings rates',
    },
    {
        id: 'Leave categories',
        label: 'Leave Categories',
        href: '/settings/leave-categories',
        permission: 'manage leave',
    },
    {
        id: 'Payment methods',
        label: 'Payment Methods',
        href: '/settings/payment-methods',
        permission: 'manage settings payment methods',
    },
    {
        id: 'Import',
        label: 'Import',
        href: '/settings/import',
        // Admin/developer only — role-gated (not permission-gated) to match
        // the backend's deliberate `role:admin,developer` middleware.
        permission: null,
    },
] as const;

export default function SettingsPrimaryLayout({
    children,
    actionNode,
}: LayoutProps) {
    const { can, hasRole } = usePermission(); // Used to permission
    const { url } = usePage(); // Used to automatically highlight the active tab
    const canImport = hasRole('admin') || hasRole('developer');

    const visibleLinks = NAV_LINKS.filter((link) =>
        link.permission === null ? canImport : can(link.permission),
    );
    const activeHref =
        visibleLinks.find((link) => url.startsWith(link.href))?.href ??
        visibleLinks[0]?.href;

    return (
        <>
            <div data-cy="settings-primary-layout-div-1">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                        <h1
                            className="text-xl font-semibold text-ink"
                            data-cy="settings-primary-layout-h1-settings"
                        >
                            Settings
                        </h1>
                        <p
                            className="text-sm text-neutral-500"
                            data-cy="settings-primary-layout-p-manage-user-accounts-partner-schools-and"
                        >
                            Manage user accounts, partner schools, and academic
                            reference data
                        </p>
                    </div>
                    <div>{actionNode}</div>
                </div>
                <div
                    className="lss-scrollbar mb-4 hidden sm:flex sm:gap-5 sm:overflow-x-auto sm:border-b sm:border-neutral-200 sm:pl-0.5"
                    data-cy="settings-primary-layout-div-4"
                >
                    {visibleLinks.map((link) => {
                        const isActive = link.href === activeHref;

                        return (
                            <Link
                                key={link.id}
                                href={link.href}
                                className={cn(
                                    'pb-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                        : 'text-neutral-500 hover:text-neutral-700',
                                )}
                                data-cy="settings-primary-layout-link-link-href"
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="mb-4 sm:hidden">
                    <Dropdown
                        options={visibleLinks.map((link) => ({
                            label: link.label,
                            value: link.href,
                        }))}
                        value={activeHref}
                        onChange={(href) => router.visit(href)}
                        data-cy="settings-primary-layout-dropdown-mobile"
                    />
                </div>
                {children}
            </div>
        </>
    );
}
