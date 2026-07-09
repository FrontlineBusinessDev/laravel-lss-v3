import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';

export interface AcademicLearningOutcomes extends Record<string, unknown> {
    id: number;
    status: string;
    learning_outcomes: string;
    academic_industry_id: number;
    academic_program_id: number;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AcademicLearningOutcomes>[] = [
    {
        key: 'learning_outcomes',
        label: 'Learning Outcomes Core',
        searchable: true,
    },
    { key: 'created_at', label: 'Configured On' },
];

export const fields: FieldDef<AcademicLearningOutcomes>[] = [
    {
        key: 'status',
        label: 'Active',
        type: 'checkbox',
        defaultValue: true,
    },
    {
        key: 'academic_industry_id',
        label: 'Target Academic Industry',
        type: 'select',
        required: true,
        placeholder: 'Select target industry...',
        colSpan: 2,
    },
    {
        key: 'academic_program_id',
        label: 'Target Academic Program',
        type: 'select',
        required: true,
        placeholder: 'Select target program...',
        colSpan: 2,
    },
    {
        key: 'learning_outcomes',
        label: 'Expected Learning Outcomes Statement',
        type: 'textarea',
        required: true,
        placeholder: 'Explain core dynamic criteria to master...',
        colSpan: 2,
    },
];
