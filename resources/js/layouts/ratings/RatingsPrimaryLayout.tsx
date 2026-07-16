import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    { id: 'Task Rating', label: 'Task Rating', href: '/ratings' },
    { id: 'Behavioral Rating', label: 'Behavioral Rating', href: '/behavioral-rating' },
] as const;

export default function RatingsPrimaryLayout({ children }: LayoutProps) {
    const { url } = usePage(); // Used to automatically highlight the active tab

    return (
        <div data-cy="ratings-primary-layout-div-1">
            <h1
                className="text-xl font-semibold text-ink"
                data-cy="ratings-primary-layout-h1-ratings"
            >
                Ratings
            </h1>
            <p
                className="mb-4 text-sm text-neutral-500"
                data-cy="ratings-primary-layout-p-evaluate-trainees-on-tasks-and-behavior"
            >
                Evaluate trainees on completed tasks and overall behavior
            </p>
            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="ratings-primary-layout-div-4"
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
                            data-cy="ratings-primary-layout-link-link-href"
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
