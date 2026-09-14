/**
 * @file api-service-layer/public/seminarRegister.ts
 * Guest seminar-registration submission — `POST /seminars/register/{token}`
 * (PublicSeminarRegistrationController::store). Plain JSON (no file uploads),
 * unlike the batch equivalent.
 */

import type {
    SeminarRegisterPayload,
    SeminarRegisterResult,
} from '@/types/modules/public/seminarRegister';
import { http, unwrap } from '../client';

export const publicSeminarRegisterService = {
    submit: async (
        token: string,
        payload: SeminarRegisterPayload,
    ): Promise<SeminarRegisterResult> =>
        unwrap<SeminarRegisterResult>(
            await http.post(`/seminars/register/${token}`, payload),
        ),
};
