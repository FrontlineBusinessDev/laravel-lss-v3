import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicProgram extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    course_name: string;
    specialization: string | null;
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
        label: 'Program Abbreviation',
        searchable: true,
        filterable: true,
    },
    {
        key: 'course_name',
        label: 'Course Title',
        searchable: true,
        filterable: true,
    },
    {
        key: 'specialization',
        label: 'Specialization',
        searchable: true,
    },
    { key: 'created_at', label: 'Created At' },
];

export const fields: FieldDef<AcademicProgram>[] = [
    {
        key: 'status',
        label: 'Active',
        type: 'checkbox',
        defaultValue: true,
    },
    {
        key: 'name',
        label: 'Program Code / Abbreviation',
        type: 'text',
        placeholder: 'BSCS',
        required: true,
        colSpan: 2,
    },
    {
        key: 'course_name',
        label: 'Full Course Title',
        type: 'text',
        placeholder: 'Bachelor of Science in Computer Science',
        required: true,
        colSpan: 2,
    },
    {
        key: 'specialization',
        label: 'Specialization (Tracks)',
        type: 'text',
        placeholder: 'Software Engineering (Optional)',
        colSpan: 2,
    },
];
