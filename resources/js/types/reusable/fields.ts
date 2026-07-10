/**
 * @file types/reusable/fields.ts
 * Field + modal contracts consumed by RecordModal and DataTableField.
 */

export type ModalMode = 'create' | 'edit';

export type FieldType =
    | 'text'
    | 'email'
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
}

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
