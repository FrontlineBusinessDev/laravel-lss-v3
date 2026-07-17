import { useGlobalModal } from '@/components/global-modal';
import {
    AddRecordButton,
    SettingsListHeader,
    SettingsRow,
    TextCell,
    buildRecordMenu,
} from '@/components/settings';
import { StatusBadge } from '@/components/StatusBadge';
import type { CardActions } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { StatusKind } from '@/types';
import type { AcademicLearningOutcomes } from '@/types/modules/settings/academic/learning-outcomes';
import { columns } from '@/types/modules/settings/academic/learning-outcomes';
import AcademicLearningOutcomesModal from './AcademicLearningOutcomesModal';

const PERMISSION = 'manage settings academic';
const customGRID = 'sm:grid-cols-[1.6fr_1fr_2.2fr_2.5rem]';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={['Learning Outcome', 'Industry', 'Program']}
        data-cy="index-settings-list-header-1"
    />
);

const renderRow = (row: AcademicLearningOutcomes, actions: CardActions) => {
    const isArchived = row.status !== 'active';
    const badge: StatusKind = isArchived ? 'archived' : 'active';

    return (
        <SettingsRow
            grid={customGRID}
            isArchived={isArchived}
            badge={
                <StatusBadge status={badge} data-cy="index-status-badge-3" />
            }
            menu={buildRecordMenu(actions, isArchived)}
            data-cy="index-settings-row-2"
        >
            <TextCell data-cy="index-text-cell-4">
                {row.learning_outcomes}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-5">
                {row.academic_industry?.name ?? '—'}
            </TextCell>
            <TextCell muted data-cy="index-text-cell-6">
                {row.academic_program?.name ?? '—'}
            </TextCell>
        </SettingsRow>
    );
};

export default function Index() {
    const modal = useGlobalModal<AcademicLearningOutcomes | null>(
        'academicLearningOutcomes',
        null,
    );

    return (
        <>
            <div className="float-right">
                <AddRecordButton
                    label="Add Learning Outcomes"
                    permission={PERMISSION}
                    onClick={() => {
                        modal.setData(null);
                        modal.setOpen(true);
                    }}
                />
            </div>
            <DataTableCardField<AcademicLearningOutcomes>
                apiUrl="/settings/academic/learning-outcomes"
                apiQueryKey="settings-academic/learning-outcomes"
                columns={columns}
                defaultSortBy="first_name"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                listHeader={listHeader}
                renderCard={renderRow}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
                data-cy="index-data-table-field-7"
            />
            <AcademicLearningOutcomesModal
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </>
    );
}
