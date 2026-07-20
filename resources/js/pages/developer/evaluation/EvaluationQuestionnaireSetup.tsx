import { useGlobalModal } from '@/components/global-modal';
import type { ColumnDef } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type {
    EvaluationSeminarQuestion,
    EvaluationTrainerQuestion,
} from '@/types/modules/evaluation/evaluation';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import EvaluationQuestionModal, {
    TYPE_LABEL,
} from './EvaluationQuestionModal';

const TYPE_FILTER_PAIRS = [
    { value: '', label: 'All Types' },
    { value: 'rating', label: TYPE_LABEL.rating },
    { value: 'text', label: TYPE_LABEL.text },
];

function buildColumns<
    T extends EvaluationTrainerQuestion | EvaluationSeminarQuestion,
>(): ColumnDef<T>[] {
    return [
        { key: 'question', label: 'Question', searchable: true },
        { key: 'section', label: 'Section', filterable: true },
        {
            key: 'type',
            label: 'Type',
            filterable: true,
            type: 'select',
            typeData: TYPE_FILTER_PAIRS,
            exactFilters: true,
            render: (v) => TYPE_LABEL[v as EvaluationTrainerQuestion['type']],
        },
        { key: 'order', label: 'Order', sortable: true },
        {
            key: 'is_critical',
            label: 'Critical',
            render: (v) => (v ? 'Critical' : '—'),
        },
        {
            key: 'status',
            label: 'Status',
            filterable: true,
            type: 'select',
            typeData: STATUS_FILTER_PAIRS,
            exactFilters: true,
        },
    ];
}

interface Props {
    category: 'Trainer' | 'Seminar';
}

/**
 * Question-bank CRUD grid shared by the Trainer and Seminar Questionnaire
 * tabs — same shape, different backing endpoint. Mirrors
 * developer/ratings/BehavioralAssessmentSetup.tsx.
 */
export function EvaluationQuestionnaireSetup({ category }: Props) {
    const apiUrl =
        category === 'Trainer'
            ? '/evaluation/trainer-questionnaire'
            : '/evaluation/seminar-questionnaire';
    const apiQueryKey =
        category === 'Trainer'
            ? 'evaluation-trainer-questionnaire'
            : 'evaluation-seminar-questionnaire';
    const permission = 'manage evaluation';

    const modal = useGlobalModal<
        EvaluationTrainerQuestion | EvaluationSeminarQuestion | null
    >(`evaluationQuestion-${category}`, null);

    return (
        <div>
            <p className="mb-4 text-sm text-neutral-500">
                {category === 'Trainer'
                    ? 'Manage the questions trainees use to evaluate the trainer(s) who supervised their required hours.'
                    : 'Manage the questions participants use to evaluate the resource speaker(s) of a seminar.'}
            </p>
            <DataTableCardField<
                EvaluationTrainerQuestion | EvaluationSeminarQuestion
            >
                apiUrl={apiUrl}
                apiQueryKey={apiQueryKey}
                columns={buildColumns()}
                defaultSortBy="order"
                editPermission={permission}
                archivePermission={permission}
                deletePermission={permission}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
            />
            <EvaluationQuestionModal
                category={category}
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </div>
    );
}
