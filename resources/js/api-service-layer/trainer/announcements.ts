/**
 * @file api-service-layer/trainer/announcements.ts
 * Trainer-scoped Announcements service — `/trainer/announcements`
 * (crudModule). Batch-scoping and ownership are enforced server-side by
 * AnnouncementsController/AnnouncementPolicy, not here.
 */

import type { AnnouncementInput, Announcements } from '@/types/modules/announcements/announcements';
import { createCrudResource, type LookupOption } from '../http';
import { http, unwrap } from '../client';

export const trainerAnnouncementService = {
    ...createCrudResource<Announcements, AnnouncementInput>({
        baseUrl: '/trainer/announcements',
    }),

    /** GET /trainer/announcements/batch-options — this trainer's assigned batches only. */
    batchOptions: async (): Promise<LookupOption[]> =>
        unwrap<LookupOption[]>(await http.get('/trainer/announcements/batch-options')),
};
