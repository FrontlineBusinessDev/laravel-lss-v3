import type { GroupDiscount } from '@/types/modules/settings/academic/group-discount';
import type { HoursDiscount } from '@/types/modules/settings/academic/hours-discount';
import type { Rate } from '@/types/modules/settings/academic/rates';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

/**
 * Not a crudModule resource — just the fixed f2f/online rate pair. The page
 * already receives the current values as an Inertia prop, so only `update` is
 * needed here.
 */
export const ratesService = {
    update: async (data: Rate): Promise<Rate> =>
        unwrap<Rate>(await http.put('/settings/rates', data)),
};

export const hoursDiscountService = createCrudResource<
    HoursDiscount,
    Partial<HoursDiscount>
>({ baseUrl: '/settings/rates/hours-discounts' });

export const groupDiscountService = createCrudResource<
    GroupDiscount,
    Partial<GroupDiscount>
>({ baseUrl: '/settings/rates/group-discounts' });
