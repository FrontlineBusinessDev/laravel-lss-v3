import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
}

const NAV_LINKS = [
    { id: 'Task Management', label: 'Task Management', href: '/tasks' },
    { id: 'Daily Task Sheet', label: 'Daily Task Sheet', href: '/daily-task' },
] as const;

export default function TasksPrimaryLayout({ children }: LayoutProps) {
    const { url } = usePage(); // Used to automatically highlight the active tab

    return (
        <div data-cy="tasks-primary-layout-div-1">
            <h1
                className="text-xl font-semibold text-ink"
                data-cy="tasks-primary-layout-h1-tasks"
            >
                Tasks
            </h1>
            <p
                className="mb-4 text-sm text-neutral-500"
                data-cy="tasks-primary-layout-p-daily-trainee-task-assignment-and-reporting"
            >
                Daily trainee task assignment and reporting
            </p>
            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="tasks-primary-layout-div-4"
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
                            data-cy="tasks-primary-layout-link-link-href"
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
