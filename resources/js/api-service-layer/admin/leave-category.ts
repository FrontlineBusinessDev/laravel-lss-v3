/**
 * @file api-service-layer/admin/leave-category.ts
 * Leave category limits service — `/settings/leave-categories` (crudModule).
 */

import type { LeaveCategories } from '@/types/modules/settings/leave-categories';
import { createCrudResource } from '../http';

export type LeaveCategoryInput = Partial<LeaveCategories>;

export const leaveCategoryService = createCrudResource<
    LeaveCategories,
    LeaveCategoryInput
>({ baseUrl: '/settings/leave-categories' });
