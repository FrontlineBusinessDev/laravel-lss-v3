/**
 * @file index.ts
 * Public API of the table module — the shared type contracts consumed by
 * pages that build their own columns/fields/card renderers.
 *
 *   import type { CardActions, ColumnDef } from '@/components/table';
 *   import { DataTableCardField } from '@/components/table/DataTableCardField';
 */

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
