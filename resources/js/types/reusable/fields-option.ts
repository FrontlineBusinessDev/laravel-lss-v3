/**
 * @file types/reusable/fields-option.ts
 * Props contract for the AsyncSelectField control (async-select fields).
 */

import type { FieldOption } from '@/types/reusable/fields';

export interface AsyncSelectFieldProps {
    value: unknown;
    onChange: (value: unknown) => void;
    loadOptions: (query: string) => Promise<FieldOption[]>;
    getOptionLabel?: (value: unknown) => string;
    placeholder?: string;
    debounceMs?: number;
    minSearchLength?: number;
    disabled?: boolean;
    error?: string;
}
