import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
    actionNode?: ReactNode;
}

const NAV_LINKS = [
    { id: 'Annual', label: 'Annual', href: '/reports/annual' },
    { id: 'Batch', label: 'Batch', href: '/reports/batch' },
] as const;

export default function ReportsPrimaryLayout({
    children,
    actionNode,
}: LayoutProps) {
    const { url } = usePage();
    return (
        <div data-cy="reports-primary-layout-div-1">
            <div
                className="no-print mb-4 flex items-center justify-between"
                data-cy="reports-primary-layout-div-2"
            >
                <div>
                    <h1
                        className="text-xl font-semibold text-ink"
                        data-cy="reports-primary-layout-h1-reports"
                    >
                        Reports
                    </h1>
                    <p
                        className="text-sm text-neutral-500"
                        data-cy="reports-primary-layout-p-annual-and-per-batch"
                    >
                        Annual and per-batch training summaries, activities, and
                        financial totals
                    </p>
                </div>
                {actionNode && actionNode}
            </div>
            <div
                className="no-print mb-4 flex gap-5 border-b border-neutral-200 pl-0.5"
                data-cy="reports-primary-layout-div-nav"
            >
                {NAV_LINKS.map((link) => {
                    const isActive = url.startsWith(link.href);
                    return (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={cn(
                                'pb-2.5 text-xs font-medium transition-colors',
                                isActive
                                    ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                            data-cy="reports-primary-layout-link-nav"
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
            {children}
        </div>
    );
}
