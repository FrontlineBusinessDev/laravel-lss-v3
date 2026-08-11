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
        id: 'Academic Industry',
        label: 'Industry',
        href: '/settings/academic/industry',
        permission: 'manage settings academic',
    },
    {
        id: 'Academic Level',
        label: 'Level',
        href: '/settings/academic/level',
        permission: 'manage settings academic',
    },
    {
        id: 'Academic Program',
        label: 'Program',
        href: '/settings/academic/program',
        permission: 'manage settings academic',
    },
    {
        id: 'Academic Program Type',
        label: 'Program Type',
        href: '/settings/academic/program-type',
        permission: 'manage settings academic',
    },
    {
        id: 'Academic Learning Outcomes',
        label: 'Learning Outcomes',
        href: '/settings/academic/learning-outcomes',
        permission: 'manage settings academic',
    },
] as const;
export default function SettingsAcademicLayout({ children }: LayoutProps) {
    const { can } = usePermission(); // Used to permission
    const { url } = usePage(); // Used to automatically highlight the active tab
    // 1. Check access for both targets
    const hasAcademicAccess = can('manage settings academic');
    // 2. Only show the navigation if they can switch between BOTH
    const showNavigation = hasAcademicAccess;
    const activeHref =
        NAV_LINKS.find((link) => url === link.href)?.href ?? NAV_LINKS[0].href;

    return (
        <>
            {showNavigation && (
                <>
                    <div
                        className="my-2 hidden flex-wrap gap-1.5 sm:inline-flex"
                        data-cy="settings-academic-layout-div-1"
                    >
                        {NAV_LINKS.map((link) => {
                            const isActive = url === link.href;
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
                                    data-cy="settings-academic-layout-link-link-href"
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
                            data-cy="settings-academic-layout-dropdown-mobile"
                        />
                    </div>
                </>
            )}
            {!showNavigation && <div className="h-5" />}
            {children}
        </>
    );
}
