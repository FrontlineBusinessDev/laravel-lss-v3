/**
 * @file components/table/types.ts
 * Barrel that re-exports the canonical reusable contracts under the relative
 * path the table sub-modules import from (`../types` / `./types`). Keeps a
 * single source of truth in `@/types/reusable/*` while satisfying both paths.
 */

export type {
    CrudQueryParams,
    PaginatedResponse,
    PaginationMeta,
    TableApiResponse,
} from '@/types/reusable/pagination';
export type {
    FieldDef,
    FieldOption,
    FieldType,
    ModalMode,
} from '@/types/reusable/fields';
export type { CardActions } from '@/types/reusable/card';
export type {
    ColumnDef,
    DataTableProps,
    InUseEntry,
    ModalState,
    RenderModalProps,
    StatusFilterTab,
} from '@/types/reusable/data-table';
