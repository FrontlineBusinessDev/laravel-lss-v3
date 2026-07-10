import { apiFetchJson } from '@/lib/apiFetch';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { FieldDef, FieldOption } from '@/types/reusable/fields';

export interface AcademicLearningOutcomes extends Record<string, unknown> {
    id: number;
    status: string;
    learning_outcomes: string;
    academic_industry_id: number;
    academic_program_id: number;
    created_at: string;
    updated_at: string;
}

interface LookupItem {
    id: number;
    name: string;
}

/**
 * Fetches active options from a `crudModule` `/lookup` endpoint and maps them
 * into FieldOption shape for the async-select control. Shared by the modal
 * fields (below) and the listing-page industry/program filters.
 */
export async function loadLookupOptions(
    baseUrl: string,
    query: string,
): Promise<FieldOption[]> {
    const res = await apiFetchJson<LookupItem[]>(
        `${baseUrl}/lookup?status=active&q=${encodeURIComponent(query)}`,
    );

    return (res.data ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
    }));
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
        type: 'async-select',
        required: true,
        placeholder: 'Select target industry...',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
    },
    {
        key: 'academic_program_id',
        label: 'Target Academic Program',
        type: 'async-select',
        required: true,
        placeholder: 'Select target program...',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/program', q),
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
