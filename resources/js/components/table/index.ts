/**
 * @file index.ts
 * Public API of the DataTableField module.
 *
 * Import everything from this single entry point:
 *
 *   import { DataTableField } from '@/components/data-table';
 *   import type { ColumnDef, FieldDef } from '@/components/data-table';
 */

export { DataTableField, default } from './DataTableField';

// Types — re-exported so consumers don't need to know internal paths
export type {
    CardActions,
    ColumnDef,
    DataTableProps,
    FieldDef,
    FieldType,
    ModalMode,
    PaginationMeta,
    TableApiResponse,
} from './types';

// Hooks — exported for consumers who want to build custom table UIs
export {
    useDebouncedValue,
    useInvalidateTable,
    useTableQuery,
    useTableRefresh,
} from './hooks';

// Utils — exported for consumers who want to reuse helpers
export {
    buildArchiveUrl,
    buildDeleteUrl,
    buildRestoreUrl,
    deriveFieldsFromColumns,
    formatCell,
    getCsrfToken,
    getRowId,
    isFieldDisabled,
    isFieldVisible,
} from './utils';
