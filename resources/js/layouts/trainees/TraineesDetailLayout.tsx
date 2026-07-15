import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AppTrainees } from '@/types/modules/trainees/trainees';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import React, { ReactNode } from 'react';

export default function TraineesDetailLayout({
    trainee,
    children,
}: {
    trainee: AppTrainees;
    children: ReactNode;
}) {
    const { toast } = useToast();
    const { url } = usePage();
    const path = url.split('?')[0];
    const displayStatus = trainee.status;

    const TABS = [
        {
            label: 'Personal Information',
            href: `/trainees/${trainee.id}`,
        },
        {
            label: 'Academic Information',
            href: `/trainees/${trainee.id}/academic-information`,
        },
        {
            label: 'Documents',
            href: `/trainees/${trainee.id}/documents`,
        },
        {
            label: 'Learning Outcomes',
            href: `/trainees/${trainee.id}/learning-outcomes`,
        },
        {
            label: 'Payment Details',
            href: `/trainees/${trainee.id}/payment-details`,
        },
        {
            label: 'Ratings',
            href: `/trainees/${trainee.id}/ratings`,
        },
        {
            label: 'Certificate',
            href: `/trainees/${trainee.id}/certificate`,
        },
        {
            label: 'Biometrics',
            href: `/trainees/${trainee.id}/biometrics`,
        },
    ];

    return (
        <>
            <div data-cy="detail-div-1">
                <Link
                    href="/trainees"
                    className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
                    data-cy="batch-detail-layout-link-batches"
                >
                    <ArrowLeft
                        size={14}
                        data-cy="batch-detail-layout-arrow-left-3"
                    />
                    Back to trainees
                </Link>
            </div>

            <div
                className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                data-cy="detail-div-4"
            >
                <div className="flex items-center gap-3" data-cy="detail-div-5">
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700"
                        data-cy="detail-div-6"
                    >
                        {trainee.initials}
                    </div>
                    <div data-cy="detail-div-7">
                        <div
                            className="mb-0.5 flex items-center gap-2"
                            data-cy="detail-div-8"
                        >
                            <span
                                className="text-lg font-semibold text-ink"
                                data-cy="detail-span-9"
                            >
                                {trainee.full_name}
                            </span>
                            <span
                                className={
                                    displayStatus === 'active'
                                        ? 'inline-flex items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs leading-5 font-medium text-success-800'
                                        : 'inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs leading-5 font-medium text-neutral-600'
                                }
                                data-cy="detail-span-10"
                            >
                                {displayStatus}
                            </span>
                        </div>
                        <p
                            className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500"
                            data-cy="detail-p-11"
                        >
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-12"
                            >
                                <Mail size={12} data-cy="detail-mail-13" />{' '}
                                {trainee.email}
                            </span>
                            <span
                                className="flex items-center gap-1"
                                data-cy="detail-span-14"
                            >
                                <Phone size={12} data-cy="detail-phone-15" />{' '}
                                {trainee.mobile_number}
                            </span>
                            <span data-cy="detail-span-16">
                                {trainee.batchNo} · {trainee.school}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="lss-scrollbar mb-4 flex gap-5 overflow-x-auto border-b border-neutral-200 pl-0.5"
                data-cy="detail-div-17"
            >
                {TABS.map((t) => {
                    const active = path === t.href;
                    return (
                        <Link
                            href={t.href}
                            className={cn(
                                'pb-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                                active
                                    ? 'border-b-2 border-brand-500 font-semibold text-ink'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                            data-cy="detail-button-set-tab"
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>

            {children}
        </>
    );
}
