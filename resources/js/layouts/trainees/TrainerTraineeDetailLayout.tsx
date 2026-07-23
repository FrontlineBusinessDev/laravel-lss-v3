import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/Avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types/reusable/status-kind';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

/**
 * Read-only trainer analog of TraineesDetailLayout — header + tab bar, no
 * archive/delete/avatar-crop mutation affordances (those stay admin-only).
 */
export default function TrainerTraineeDetailLayout({
    trainee,
    children,
}: {
    trainee: TraineeDetail;
    children: ReactNode;
}) {
    const { url } = usePage();
    const path = url.split('?')[0];
    const badge = STATUS_BADGE[trainee.status] ?? 'active';

    const tabs = [
        { label: 'Personal Info', href: `/trainer/trainees/${trainee.id}` },
        {
            label: 'Academic Info',
            href: `/trainer/trainees/${trainee.id}/academic-info`,
        },
        {
            label: 'Documents',
            href: `/trainer/trainees/${trainee.id}/documents`,
        },
        {
            label: 'Learning Outcomes',
            href: `/trainer/trainees/${trainee.id}/learning-outcomes`,
        },
    ];

    return (
        <div>
            <Link
                href="/trainer/trainees"
                className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
            >
                <ArrowLeft size={14} />
                Back to trainees
            </Link>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={trainee.avatar_url}
                        name={trainee.name}
                        initials={trainee.initials}
                        size="lg"
                    />
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-lg font-semibold text-ink">
                                {trainee.name}
                            </span>
                            <StatusBadge status={badge} />
                        </div>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                                <Mail size={12} /> {trainee.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Phone size={12} /> {trainee.mobile_number}
                            </span>
                            <span>{trainee.batch?.batch_code ?? '—'}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-3 flex gap-5 border-b border-neutral-200 pl-0.5">
                {tabs.map((t) => {
                    const active = path === t.href;
                    return (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={cn(
                                'pb-2.5 text-xs font-medium transition-colors',
                                active
                                    ? 'border-b-2 border-brand-500 text-ink'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>

            {children}
        </div>
    );
}
