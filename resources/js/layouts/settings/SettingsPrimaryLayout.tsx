import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

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
] as const;

export default function SettingsPrimaryLayout({
    children,
    actionNode,
}: LayoutProps) {
    const { can } = usePermission(); // Used to permission
    const { url } = usePage(); // Used to automatically highlight the active tab

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
                    className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                    data-cy="settings-primary-layout-div-4"
                >
                    {NAV_LINKS.map((link) => {
                        // 2. Filter tabs out dynamically based on user permissions
                        if (!can(link.permission)) return null;
                        // 3. Determine if the link is currently active
                        const isActive = url.startsWith(link.href);
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
                {children}
            </div>
        </>
    );
}
