import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
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
    return (
        <>
            <div
                className={cn(
                    'my-2 inline-flex flex-wrap gap-1.5',
                    !showNavigation && 'h-5',
                )}
            >
                {showNavigation &&
                    NAV_LINKS.map((link) => {
                        // Strict check to match current URL path exactly or partially
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
                            >
                                {link.label}
                            </Link>
                        );
                    })}
            </div>
            {children}
        </>
    );
}
