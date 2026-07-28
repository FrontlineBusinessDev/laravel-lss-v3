import type { ColumnDef } from '@/types/reusable/data-table';
import { loadLookupOptions, type FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicLearningOutcomes extends Record<string, unknown> {
    id: number;
    status: string;
    learning_outcomes: string;
    academic_industry_id: number;
    // Eager-loaded relation (serialized snake_case by Laravel) — present when
    // the list query uses `with()`. Used to show a name instead of a raw id.
    academic_industry?: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
}


export const columns: ColumnDef<AcademicLearningOutcomes>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        searchable: true,
        filterable: true,
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'learning_outcomes',
        label: 'Learning Outcomes',
        searchable: true,
        filterable: true,
    },
    {
        key: 'academic_industry_id',
        label: 'Academic Industry',
        type: 'async-select',
        searchable: true,
        filterable: true,
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
    },
    { key: 'created_at', label: 'Configured On' },
];

export const fields: FieldDef<AcademicLearningOutcomes>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
        ],
        defaultValue: 'active',
    },
    {
        key: 'academic_industry_id',
        label: 'Target Academic Industry',
        type: 'async-select',
        required: true,
        placeholder: 'Select target industry...',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
        // Show the currently-selected industry name when editing.
        initialLabel: (row) => row.academic_industry?.name,
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
