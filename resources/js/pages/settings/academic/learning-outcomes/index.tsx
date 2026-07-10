import {
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import DataTableField from '@/components/table';
import type { StatusKind } from '@/types';
import type { AcademicLearningOutcomes } from '@/types/modules/settings/academic/learning-outcomes';
import { columns, fields } from '@/types/modules/settings/academic/learning-outcomes';

const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';

const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Learning Outcome', 'Industry', 'Program']}
    />
);

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
            <TextCell muted>{row.academic_industry?.name ?? '—'}</TextCell>
            <TextCell muted>{row.academic_program?.name ?? '—'}</TextCell>
        </SettingsRow>
    );
};

export default function Index() {
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
        />
    );
}
