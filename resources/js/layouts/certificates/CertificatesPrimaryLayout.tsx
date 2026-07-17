import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    actionNode?: ReactNode;
}

const NAV_LINKS = [
    { id: 'Trainees', label: 'Trainees', href: '/certificates/trainees' },
    { id: 'Seminar', label: 'Seminar', href: '/certificates/seminar' },
    { id: 'Citations', label: 'Citations', href: '/certificates/citations' },
] as const;

export default function CertificatesPrimaryLayout({ children, actionNode }: LayoutProps) {
    const { url } = usePage();

    return (
        <div data-cy="certificates-primary-layout-div-1">
            <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold text-ink" data-cy="certificates-primary-layout-h1-certificates">
                        Certificates
                    </h1>
                    <p className="text-sm text-neutral-500" data-cy="certificates-primary-layout-p-subtitle">
                        Issue and manage trainee and seminar certificates, and design reusable citations
                    </p>
                </div>
                <div>{actionNode}</div>
            </div>
            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="certificates-primary-layout-div-4"
            >
                {NAV_LINKS.map((link) => {
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
                            data-cy="certificates-primary-layout-link-nav"
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
