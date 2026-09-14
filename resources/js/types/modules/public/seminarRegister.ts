/**
 * @file types/modules/public/seminarRegister.ts
 * Payload/response shapes for the guest seminar-registration form
 * (PublicSeminarRegistrationController::store, resources/js/pages/public/seminar-register).
 */

export interface SeminarRegisterPayload {
    name: string;
    email: string;
    mobile: string;
    location: string;
    profession: string;
    is_student: boolean;
    student_id: string;
}

export interface SeminarRegisterResult {
    topic: string;
}
