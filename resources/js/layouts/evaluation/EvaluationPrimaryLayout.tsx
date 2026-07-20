import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    actionNode?: ReactNode;
}

const NAV_LINKS = [
    {
        id: 'Overview',
        label: 'Overview',
        href: '/evaluation/overview',
        permission: 'manage evaluation',
    },
    {
        id: 'Trainer Questionnaire',
        label: 'Trainer Questionnaire',
        href: '/evaluation/trainer-questionnaire',
        permission: 'manage evaluation',
    },
    {
        id: 'Seminar Questionnaire',
        label: 'Seminar Questionnaire',
        href: '/evaluation/seminar-questionnaire',
        permission: 'manage evaluation',
    },
] as const;

export default function EvaluationPrimaryLayout({
    children,
    actionNode,
}: LayoutProps) {
    const { can } = usePermission(); // Used to permission
    const { url } = usePage(); // Used to automatically highlight the active tab

    return (
        <div>
            <div data-cy="evaluation-primary-layout-div-1">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                        <h1
                            className="text-xl font-semibold text-ink"
                            data-cy="evaluation-primary-layout-h1-settings"
                        >
                            Evaluation
                        </h1>
                        <p
                            className="text-sm text-neutral-500"
                            data-cy="settings-primary-layout-p-manage-user-accounts-partner-schools-and"
                        >
                            Trainee-to-trainer and participant-to-speaker
                            feedback questionnaires
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
        </div>
    );
}
