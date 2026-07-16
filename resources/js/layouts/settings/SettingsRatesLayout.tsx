import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    {
        id: 'Default Rates',
        label: 'Default Rates',
        href: '/settings/rates',
    },
    {
        id: 'Hours Discounts',
        label: 'Hours Discounts',
        href: '/settings/rates/hours-discounts',
    },
    {
        id: 'Group Discounts',
        label: 'Group Discounts',
        href: '/settings/rates/group-discounts',
    },
] as const;

export default function SettingsRatesLayout({ children }: LayoutProps) {
    const { url } = usePage();
    const path = url.split('?')[0];

    return (
        <>
            <div
                className="mb-3 inline-flex flex-wrap gap-1.5"
                data-cy="settings-academic-rates-layout-div-1"
            >
                {NAV_LINKS.map((link) => {
                    const isActive = path === link.href;
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
                            data-cy="settings-academic-rates-layout-link"
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
