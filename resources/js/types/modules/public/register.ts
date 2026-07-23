/**
 * @file types/modules/public/register.ts
 * Payload/response shapes for the guest batch-registration form
 * (PublicRegistrationController::store, resources/js/pages/public/register).
 */

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    birth_place: string;
    gender: string;
    mobile_number: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    school_id: string;
    academic_level_id: string;
    required_hours: string;
    resume: File | null;
    endorsement_letter: File | null;
    moa: File | null;
    liability_waiver: File | null;
}

export interface RegisterResult {
    batch_code: string;
}
