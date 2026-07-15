/**
 * @file types/reusable/fields.ts
 * Field + modal contracts consumed by RecordModal and DataTableField.
 */

import { apiFetchJson } from '@/lib/apiFetch';

interface LookupItem {
    id: number;
    name: string;
}
export type ModalMode = 'create' | 'edit';

export type FieldType =
    | 'text'
    | 'email'
    | 'url'
    | 'number'
    | 'password'
    | 'date'
    | 'datetime-local'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'async-select'
    | 'file';

export interface ExistingFile {
    id: string | number;
    name: string;
    url: string;
    size?: number;
    type?: string;
}

export interface FileFieldValue {
    existing: ExistingFile[];
    files: File[];
    removedIds: Array<string | number>;
}

export interface FieldOption {
    value: string;
    label: string;
    columnNameShow?: string;
}
/**
 * Fetches active options from a `crudModule` `/lookup` endpoint and maps them
 * into FieldOption shape for the async-select control. Shared by the modal
 * fields (below) and the listing-page industry/program filters.
 */
export async function loadLookupOptions(
    baseUrl: string,
    query: string,
    columnNameShow?: string,
): Promise<FieldOption[]> {
    const res = await apiFetchJson<LookupItem[]>(
        `${baseUrl}/lookup?status=active&q=${encodeURIComponent(query)}`,
    );

    return (res.data ?? []).map((item) => {
        // Determine the label: use the dynamic property if provided,
        // otherwise default to 'name'.
        const displayKey =
            columnNameShow && item.hasOwnProperty(columnNameShow)
                ? columnNameShow
                : 'name';

        return {
            value: String(item.id),
            label: String(item[displayKey as keyof LookupItem] ?? ''),
            columnNameShow: columnNameShow,
        };
    });
}
/**
 * Wraps a fixed option list in the async `loadOptions` signature so Setup and
 * Status flow through the same async-select filter control as the FK lookups
 * (which auto-prepends an "All" reset). Satisfies the "Async Select interface"
 * requirement without a bespoke filter type.
 */
export const staticOptions =
    (options: FieldOption[]) => async (): Promise<FieldOption[]> =>
        options;
/**
 * Declarative description of a single form field rendered by RecordModal.
 * `T` is the row type so `disabled`/`showOnEdit` predicates can be row-aware.
 */
export interface FieldDef<T = unknown> {
    key: string;
    label: string;
    type?: FieldType;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    disabled?: boolean | ((mode: ModalMode, row?: T) => boolean);
    showOnCreate?: boolean;
    showOnEdit?: boolean | ((row?: T) => boolean);
    defaultValue?: unknown;
    options?: FieldOption[];
    validate?: (
        value: unknown,
        values: Record<string, unknown>,
    ) => string | undefined;
    /** Submit under a different key than the display/read key. */
    payloadKey?: string;
    /** Transform the raw value before it is sent to the API. */
    transform?: (raw: unknown) => unknown;
    colSpan?: 1 | 2;
    // async-select only
    loadOptions?: (query: string) => Promise<FieldOption[]>;
    getOptionLabel?: (value: unknown) => string;
    /**
     * Resolves the display label for the currently-selected value in edit mode
     * (e.g. from an eager-loaded relation on the row). Lets the control show the
     * previously-selected record's name without scanning the lookup's first
     * page — works even when that record is archived or paged out.
     */
    initialLabel?: (row: T) => string | undefined;
    debounceMs?: number;
    minSearchLength?: number;

    // ── only relevant when type === 'file' ──
    multiple?: boolean;
    accept?: string;
    maxSizeMB?: number;
    maxFiles?: number;
    preview?: boolean;
}
