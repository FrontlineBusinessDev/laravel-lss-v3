import { router } from '@inertiajs/react';
import { Avatar } from '@/components/Avatar';
import { SettingsListHeader, SettingsRow, TextCell } from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import type { StatusKind } from '@/types';
import type { AppTrainees } from '@/types/modules/trainees/trainees';
import { columns } from '@/types/modules/trainees/trainees';

const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_2fr_1fr_1.2fr_2.5rem]!';

const listHeader = (
    <SettingsListHeader
        grid={TRAINEE_GRID}
        labels={['Full name', 'Email', 'Required hrs', 'Status']}
    />
);

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    active: 'active',
    inactive: 'archived',
    completed: 'completed',
    terminated: 'terminated',
};

/** Read-only: trainees across this trainer's assigned batches only. */
export default function TrainerTraineesPage() {
    const renderRow = (row: AppTrainees) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const badge = STATUS_BADGE[row.status] ?? 'active';

        return (
            <div
                role="link"
                tabIndex={0}
                onClick={() => router.visit(`/trainer/trainees/${row.id}`)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        router.visit(`/trainer/trainees/${row.id}`);
                    }
                }}
                className="cursor-pointer transition-colors hover:bg-neutral-50/70"
            >
                <SettingsRow
                    grid={TRAINEE_GRID}
                    isArchived={row.status !== 'active'}
                    badge={<StatusBadge status={badge} />}
                    menu={[]}
                >
                    <div className="flex items-center gap-2.5 font-medium text-ink">
                        <Avatar
                            src={row.avatar_url}
                            name={name}
                            initials={row.initials}
                            size="sm"
                        />
                        <span className="truncate">{name}</span>
                    </div>
                    <TextCell muted>{row.email}</TextCell>
                    <TextCell muted>{row.required_hours ?? '—'} hrs</TextCell>
                </SettingsRow>
            </div>
        );
    };

    return (
        <TrainerLayout title="Trainees">
            <p className="mb-4 text-sm text-neutral-500">
                Trainees across your assigned batches.
            </p>
            <DataTableCardField<AppTrainees>
                apiUrl="/trainer/trainees"
                apiQueryKey="trainer-trainees"
                columns={columns}
                defaultSortBy="last_name"
                listHeader={listHeader}
                renderCard={renderRow}
            />
        </TrainerLayout>
    );
}
