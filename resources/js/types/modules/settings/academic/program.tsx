import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef, loadLookupOptions } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicProgram extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    abbreviation?: string;
    academic_program_type_id?: number | null;
    // Eager-loaded relation (serialized snake_case by Laravel) — present when
    // the list query uses `with()`. Used to show the type name instead of raw id.
    academic_program_type?: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AcademicProgram>[] = [
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
        key: 'name',
        label: 'Program',
        searchable: true,
        filterable: true,
    },
    {
        key: 'abbreviation',
        label: 'Abbreviation',
        searchable: true,
        filterable: true,
    },
    {
        key: 'academic_program_type_id',
        label: 'Type',
        type: 'async-select',
        searchable: true,
        filterable: true,
        loadOptions: (q) => loadLookupOptions('/settings/academic/program-type', q),
    },
    { key: 'created_at', label: 'Created At' },
];

export const fields: FieldDef<AcademicProgram>[] = [
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
        key: 'name',
        label: 'Program',
        type: 'text',
        placeholder: 'Information Technology',
        required: true,
        colSpan: 2,
    },
    {
        key: 'abbreviation',
        label: 'Abbreviation',
        type: 'text',
        placeholder: 'IT',
        required: true,
        colSpan: 2,
    },
    {
        key: 'academic_program_type_id',
        label: 'Type',
        type: 'async-select',
        placeholder: 'Select a type...',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/program-type', q),
        initialLabel: (row) => row.academic_program_type?.name,
    },
];
