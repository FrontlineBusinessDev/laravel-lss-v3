/**
 * @file api-service-layer/public/register.ts
 * Guest batch-registration submission — `POST /register/{token}`
 * (PublicRegistrationController::store). Always multipart since `resume` is a
 * required file. Routes through the shared axios `http` instance so failures
 * surface as the typed `ApiError` (validation errors in `.errors`, a plain
 * message otherwise).
 */

import type {
    RegisterPayload,
    RegisterResult,
} from '@/types/modules/public/register';
import { http, unwrap } from '../client';
import { buildFormData } from '../form-data';

export interface RegisterWriteOptions {
    onUploadProgress?: (percent: number) => void;
}

export const publicRegisterService = {
    /** POST /register/{token} — submit a guest trainee application. */
    submit: async (
        token: string,
        payload: RegisterPayload,
        opts?: RegisterWriteOptions,
    ): Promise<RegisterResult> => {
        const body = buildFormData(payload as unknown as Record<string, unknown>);

        const response = await http.post(`/register/${token}`, body, {
            ...(opts?.onUploadProgress
                ? {
                      onUploadProgress: (e: { loaded: number; total?: number }) => {
                          if (e.total) {
                              opts.onUploadProgress!(
                                  Math.round((e.loaded / e.total) * 100),
                              );
                          }
                      },
                  }
                : {}),
        });

        return unwrap<RegisterResult>(response);
    },
};
