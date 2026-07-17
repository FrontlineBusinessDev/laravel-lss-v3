/**
 * @file api-service-layer/admin/partner-school.ts
 * Partner Schools service — `/settings/partner-schools` (crudModule).
 * Logo uploads on create/update flow through the FormData path automatically.
 */

import type { PartnerSchools } from '@/types/modules/settings/partner-schools';
import { createCrudResource } from '../http';

export type PartnerSchoolInput = Partial<PartnerSchools>;

export const partnerSchoolService = createCrudResource<
    PartnerSchools,
    PartnerSchoolInput
>({ baseUrl: '/settings/partner-schools' });
