/**
 * @file api-service-layer/admin/announcement.ts
 * Announcements service — `/announcements` (crudModule).
 */

import type { AnnouncementInput, Announcements } from '@/types/modules/announcements/announcements';
import { createCrudResource } from '../http';

export const announcementService = createCrudResource<
    Announcements,
    AnnouncementInput
>({ baseUrl: '/announcements' });
