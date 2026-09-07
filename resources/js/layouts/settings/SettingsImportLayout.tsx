import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Dropdown } from '@/components/Dropdown';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    {
        id: 'Import',
        label: 'Import',
        href: '/settings/import',
    },
    {
        id: 'Logs',
        label: 'Logs',
        href: '/settings/import/logs',
    },
] as const;

export default function SettingsImportLayout({ children }: LayoutProps) {
    const { url } = usePage();
    const path = url.split('?')[0];
    const activeHref =
        NAV_LINKS.find((link) => path === link.href)?.href ?? NAV_LINKS[0].href;

    return (
        <>
            <div
                className="mb-3 hidden flex-wrap gap-1.5 sm:inline-flex"
                data-cy="settings-import-layout-div-1"
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
                            data-cy="settings-import-layout-link"
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
            <div className="mb-3 sm:hidden">
                <Dropdown
                    options={NAV_LINKS.map((link) => ({
                        label: link.label,
                        value: link.href,
                    }))}
                    value={activeHref}
                    onChange={(href) => router.visit(href)}
                    variant="pill"
                    data-cy="settings-import-layout-dropdown-mobile"
                />
            </div>
            {children}
        </>
    );
}
