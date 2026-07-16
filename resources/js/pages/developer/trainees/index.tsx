import { router } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { cn } from '@/lib/utils';
import type { AppTrainees } from '@/types/modules/trainees/trainees';
import { columns } from '@/types/modules/trainees/trainees';
import { GRID } from '@/types/reusable/data-table';

const TRAINEE_GRID = 'sm:grid-cols-[1.8fr_2fr_1fr_1.2fr_2.5rem]!';

const listHeader = (
    <SettingsListHeader
        grid={TRAINEE_GRID}
        labels={['Full name', 'Email', 'Required hrs', 'Status']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AppTrainees) => {
    const name = `${row.first_name} ${row.last_name}`.trim();
    const completed = Boolean(row.date_completed);

    return (
        // Clicking the row opens the trainee detail page, matching the previous
        // list behaviour. Rendered as a link so keyboard users can drill in too.
        <div
            role="link"
            tabIndex={0}
            onClick={() => router.visit(`/trainees/${row.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    router.visit(`/trainees/${row.id}`);
                }
            }}
            className={cn(
                'flex cursor-pointer flex-col gap-1 px-4 py-3 transition-colors hover:bg-neutral-50/70',
                GRID,
                TRAINEE_GRID,
            )}
            data-cy="index-div-row"
        >
            <div
                className="flex items-center gap-2.5 font-medium text-ink"
                data-cy="index-div-name"
            >
                <Avatar
                    src={row.avatar_url}
                    name={name}
                    initials={row.initials}
                    size="sm"
                    data-cy="index-avatar"
                />
                <span className="truncate" data-cy="index-span-name">
                    {name}
                </span>
            </div>
            <TextCell muted data-cy="index-text-cell-email">
                {row.email}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-hrs">
                {row.required_hours ?? '—'} hrs
            </TextCell>
            <span
                className={
                    completed
                        ? 'inline-flex w-fit items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs leading-5 font-medium text-success-800'
                        : 'inline-flex w-fit items-center rounded-pill bg-amber-50 px-2.5 py-0.5 text-xs leading-5 font-medium text-amber-700'
                }
                data-cy="index-status-badge"
            >
                {completed ? 'Completed' : 'On-going'}
            </span>
            <ChevronRight
                size={15}
                className="ml-auto text-neutral-400"
                data-cy="index-row-chevron"
            />
        </div>
    );
};

export default function TraineesListPage() {
    return (
        <>
            <h1
                className="text-xl font-semibold text-ink"
                data-cy="index-h1-trainees"
            >
                Trainees
            </h1>
            <p
                className="mb-4 text-sm text-neutral-500"
                data-cy="index-p-manage-trainees"
            >
                Manage Trainees data.
            </p>
            <DataTableCardField<AppTrainees>
                apiUrl="/trainees"
                apiQueryKey="trainees"
                columns={columns}
                defaultSortBy="last_name"
                listHeader={listHeader}
                renderCard={renderRow}
                data-cy="index-data-table-field-1"
            />
        </>
    );
}
