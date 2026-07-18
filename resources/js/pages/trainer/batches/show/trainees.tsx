import { Link } from '@inertiajs/react';
import { ArrowLeft, Briefcase, GraduationCap, Hash, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/Avatar';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/types';
import type { AppBatches } from '@/types/modules/batches/batches';
import type { TraineeRow } from '@/types/modules/batches/trainees';
import { columns } from '@/types/modules/batches/trainees';
import { GRID } from '@/types/reusable/data-table';

const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_1.4fr_0.9fr_0.9fr_2.5rem]!';

const STATUS_BADGE: Record<string, StatusKind> = {
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

interface Props {
    record: AppBatches;
}

function SummaryCard({
    icon: Icon,
    label,
    children,
}: {
    icon: typeof Hash;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                <Icon size={13} /> {label}
            </div>
            {children}
        </div>
    );
}

/**
 * Read-only batch detail for the trainer role — Trainees tab only, no
 * Activity log/Financials/Trainers tabs and no edit/archive/terminate/delete
 * actions (those stay admin-only). Trainee rows aren't linked yet: the
 * trainer trainee-detail page doesn't exist until Task 3.3 lands.
 */
export default function TrainerBatchTraineesPage({ record }: Props) {
    const badge: StatusKind = STATUS_BADGE[record.status] ?? 'active';
    const setupLabel = record.setup === 'f2f' ? 'Face-to-face' : 'Online';

    const listHeader = (
        <SettingsListHeader
            grid={TRAINEE_GRID}
            labels={['Trainee', 'School', 'Required hrs', 'Status']}
        />
    );

    const renderRow = (row: TraineeRow) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const rowBadge = STATUS_BADGE[row.status] ?? 'active';

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    GRID,
                    TRAINEE_GRID,
                    row.status !== 'active' && 'opacity-60',
                )}
            >
                <div className="flex items-center gap-2 font-medium text-ink">
                    <Avatar
                        src={row.avatar_url}
                        name={name}
                        initials={row.initials}
                        size="sm"
                    />
                    <span className="truncate">{name}</span>
                </div>
                <TextCell muted>{row.school?.school_name ?? '—'}</TextCell>
                <TextCell muted>{row.required_hours ?? '—'} hrs</TextCell>
                <StatusBadge status={rowBadge} />
                <div />
            </div>
        );
    };

    return (
        <TrainerLayout title="Batch detail">
            <Link
                href="/trainer/batches"
                className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-60"
            >
                <ArrowLeft size={14} />
                Back to batches
            </Link>

            <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-ink">
                        {record.batch_code}
                    </span>
                    <StatusBadge status={badge} />
                </div>
                <p className="text-xs text-neutral-500">
                    {record.academic_program?.name ?? '—'} ·{' '}
                    {record.academic_industry?.name ?? '—'} · {setupLabel}
                </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <SummaryCard icon={Hash} label="Batch number">
                    <span className="font-mono text-sm font-semibold text-ink">
                        {record.batch_code}
                    </span>
                </SummaryCard>
                <SummaryCard icon={Users} label="Trainees">
                    <span className="text-2xl font-semibold text-ink">
                        {record.trainees_count ?? 0}
                    </span>
                </SummaryCard>
                <SummaryCard icon={Briefcase} label="Industry">
                    <span className="text-sm font-medium text-ink">
                        {record.academic_industry?.name ?? '—'}
                    </span>
                </SummaryCard>
                <SummaryCard icon={GraduationCap} label="Program type">
                    <span className="text-sm font-medium text-ink">
                        {record.academic_program?.name ?? '—'}
                    </span>
                </SummaryCard>
            </div>

            <DataTableCardField<TraineeRow>
                apiUrl={`/trainer/batches/${record.id}/trainees`}
                apiQueryKey={['trainer-batch-trainees', String(record.id)]}
                columns={columns}
                defaultSortBy="first_name"
                listHeader={listHeader}
                renderCard={renderRow}
            />
        </TrainerLayout>
    );
}
