import { useState } from 'react';
import {
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableField from '@/components/table';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import type { StatusKind } from '@/types';
import type { AcademicLearningOutcomes } from '@/types/modules/settings/academic/learning-outcomes';
import {
    columns,
    fields,
    loadLookupOptions,
} from '@/types/modules/settings/academic/learning-outcomes';
import type { FieldOption } from '@/types/reusable/fields';

const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Name', 'Course Name', 'Specialization']}
    />
);

// Prepend an "All" (clear) option so a filter can be reset to the default.
const withAll = (options: FieldOption[]): FieldOption[] => [
    { value: '', label: 'All' },
    ...options,
];

const renderRow = (row: AcademicLearningOutcomes, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge={<StatusBadge status={badge} />}
            menu={buildRecordMenu(actions, isArchived)}
        >
            <TextCell>{row.learning_outcomes}</TextCell>
            <TextCell>{row.academic_industry_id}</TextCell>
            <TextCell>{row.academic_program_id}</TextCell>
        </SettingsRow>
    );
};

export default function Index() {
    // Both filters default to "All" (empty string ⇒ key omitted from the query).
    const [industryId, setIndustryId] = useState('');
    const [programId, setProgramId] = useState('');

    const extraFilters = {
        ...(industryId ? { academic_industry_id: industryId } : {}),
        ...(programId ? { academic_program_id: programId } : {}),
    };

    const filterControls = (
        <>
            <div className="w-full sm:w-56">
                <span className="mb-1 block text-xs font-medium">
                    Academic Industry
                </span>
                <AsyncSelectField
                    value={industryId}
                    placeholder="All"
                    onChange={(v) => {
                        // Changing industry resets program back to "All".
                        setIndustryId((v as string) ?? '');
                        setProgramId('');
                    }}
                    loadOptions={async (q) =>
                        withAll(
                            await loadLookupOptions(
                                '/settings/academic/industry',
                                q,
                            ),
                        )
                    }
                />
            </div>
            <div className="w-full sm:w-56">
                <span className="mb-1 block text-xs font-medium">
                    Academic Program
                </span>
                <AsyncSelectField
                    value={programId}
                    placeholder="All"
                    onChange={(v) => setProgramId((v as string) ?? '')}
                    loadOptions={async (q) =>
                        withAll(
                            await loadLookupOptions(
                                '/settings/academic/program',
                                q,
                            ),
                        )
                    }
                />
            </div>
        </>
    );

    return (
        <DataTableField<AcademicLearningOutcomes>
            apiUrl="/settings/academic/learning-outcomes"
            apiQueryKey="settings-academic/learning-outcomes"
            actionsCreateClassName="mt-2 sm:mt-0 ml-5"
            columns={columns}
            fields={fields}
            createLabel="Add Learning Outcomes"
            modalTitle={(s) =>
                s.mode === 'create'
                    ? 'Add Learning Outcomes'
                    : 'Edit Learning Outcomes'
            }
            defaultSortBy="first_name"
            createPermission="manage settings academic"
            editPermission="manage settings academic"
            archivePermission="manage settings academic"
            deletePermission="manage settings academic"
            listHeader={listHeader}
            renderCard={renderRow}
            extraFilters={extraFilters}
            filterControls={filterControls}
        />
    );
}
