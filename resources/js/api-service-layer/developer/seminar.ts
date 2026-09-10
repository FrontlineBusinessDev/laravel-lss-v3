/**
 * @file api-service-layer/developer/seminar.ts
 * Seminar Module — List of Seminars / Participants / Email Notifications.
 * Each page's full record set is loaded as Inertia props (see the page
 * components), so this service only covers the mutation endpoints; a
 * mutation's response is applied to local state and/or the page is reloaded
 * via router.reload() rather than re-fetching through this service.
 */

import type {
    Seminar,
    SeminarAdminAlertSetting,
    SeminarEmailTemplate,
    SeminarParticipant,
} from '@/types';
import { http, unwrap } from '../client';

export interface SeminarDraft {
    topic: string;
    description: string;
    date: string;
    venue: string;
    fee: number;
    max_participants?: number | null;
    type: string;
}

export interface SeminarRegistrationInfo {
    url: string;
    qr: string;
}

export const seminarService = {
    create: async (draft: SeminarDraft): Promise<Seminar> =>
        unwrap<Seminar>(await http.post('/seminars/list-of-seminars', draft)),

    update: async (id: string, draft: SeminarDraft): Promise<Seminar> =>
        unwrap<Seminar>(
            await http.post(`/seminars/list-of-seminars/${id}`, draft),
        ),

    complete: async (id: string): Promise<Seminar> =>
        unwrap<Seminar>(
            await http.patch(`/seminars/list-of-seminars/${id}/complete`),
        ),

    close: async (id: string): Promise<Seminar> =>
        unwrap<Seminar>(
            await http.patch(`/seminars/list-of-seminars/${id}/close`),
        ),

    dissolve: async (id: string): Promise<Seminar> =>
        unwrap<Seminar>(
            await http.patch(`/seminars/list-of-seminars/${id}/dissolve`),
        ),

    toggleRegistration: async (id: string): Promise<Seminar> =>
        unwrap<Seminar>(
            await http.patch(
                `/seminars/list-of-seminars/${id}/toggle-registration`,
            ),
        ),

    registration: async (id: string): Promise<SeminarRegistrationInfo> =>
        unwrap<SeminarRegistrationInfo>(
            await http.get(`/seminars/list-of-seminars/${id}/registration`),
        ),

    updateParticipant: async (
        id: string,
        patch: Partial<SeminarParticipant>,
    ): Promise<SeminarParticipant> =>
        unwrap<SeminarParticipant>(
            await http.patch(`/seminars/participants/${id}`, patch),
        ),

    updateEmailTemplate: async (
        id: string,
        patch: Partial<SeminarEmailTemplate>,
    ): Promise<SeminarEmailTemplate> =>
        unwrap<SeminarEmailTemplate>(
            await http.patch(
                `/seminars/email-notification/templates/${id}`,
                patch,
            ),
        ),

    sendTestEmail: async (id: string): Promise<void> => {
        await http.post(`/seminars/email-notification/templates/${id}/send-test`);
    },

    toggleAdminAlert: async (
        key: SeminarAdminAlertSetting['key'],
    ): Promise<SeminarAdminAlertSetting> =>
        unwrap<SeminarAdminAlertSetting>(
            await http.patch(
                `/seminars/email-notification/admin-alerts/${key}/toggle`,
            ),
        ),
};
