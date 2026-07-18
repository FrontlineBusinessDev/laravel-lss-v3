/**
 * @file api-service-layer/trainee/my-info.ts
 * Trainee self-service "My Info" documents — `/trainee/my-info/documents`.
 */

import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';
import { http, unwrap } from '../client';

export type TraineeDocument = TraineeDetail['documents'][number];

export const myInfoService = {
    uploadDocument: async (body: FormData): Promise<TraineeDocument> =>
        unwrap<TraineeDocument>(
            await http.post('/trainee/my-info/documents', body),
        ),
    deleteDocument: async (documentId: string | number): Promise<void> => {
        await http.delete(`/trainee/my-info/documents/${documentId}`);
    },
};
