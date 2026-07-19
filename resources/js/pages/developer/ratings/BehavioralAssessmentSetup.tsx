import { useGlobalModal } from '@/components/global-modal';
import type { ColumnDef } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { BehavioralQuestion } from '@/types/modules/ratings/behavioral';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import BehavioralQuestionModal from './BehavioralQuestionModal';

export const SECTIONS = [
    'I. Work Performance & Discipline',
    'II. Learning Ability & Technical Growth',
    'III. Teamwork & Professional Behavior',
    'IV. Technical Competency & Job Readiness',
    "V. Trainer's General Evaluation of the Trainee",
    'VI. Written Feedback',
];

export const TYPE_LABEL: Record<BehavioralQuestion['type'], string> = {
    rating: 'Rated 1–5',
    text: 'Written response',
};

const PERMISSION = 'manage behavioral questions';

const SECTION_FILTER_PAIRS = [
    { value: '', label: 'All Sections' },
    ...SECTIONS.map((s) => ({ value: s, label: s })),
];

const TYPE_FILTER_PAIRS = [
    { value: '', label: 'All Types' },
    { value: 'rating', label: TYPE_LABEL.rating },
    { value: 'text', label: TYPE_LABEL.text },
];

const columns: ColumnDef<BehavioralQuestion>[] = [
    { key: 'question', label: 'Question', searchable: true },
    {
        key: 'section',
        label: 'Section',
        filterable: true,
        type: 'select',
        typeData: SECTION_FILTER_PAIRS,
    },
    {
        key: 'type',
        label: 'Type',
        filterable: true,
        type: 'select',
        typeData: TYPE_FILTER_PAIRS,
        exactFilters: true,
        render: (v) => TYPE_LABEL[v as BehavioralQuestion['type']],
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

export function BehavioralAssessmentSetup() {
    const modal = useGlobalModal<BehavioralQuestion | null>(
        'behavioralQuestion',
        null,
    );

    return (
        <div>
            <p className="mb-4 text-sm text-neutral-500">
                Manage the Trainer Evaluation for Trainees questionnaire —
                organized into sections, with rated statements and
                written-feedback items.
            </p>
            <DataTableCardField<BehavioralQuestion>
                apiUrl="/ratings/behavioral-questions"
                apiQueryKey="behavioral-questions"
                columns={columns}
                defaultSortBy="order"
                editPermission={PERMISSION}
                archivePermission={PERMISSION}
                deletePermission={PERMISSION}
                onEditRow={(row) => {
                    modal.setData(row);
                    modal.setOpen(true);
                }}
            />
            <BehavioralQuestionModal
                open={modal.open}
                onClose={() => modal.setOpen(false)}
                row={modal.data}
            />
        </div>
    );
}
