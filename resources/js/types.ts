// Remaining on purpose: Seminars admin is still mock-backed pending a real
// CRUD backend (deferred — see memory). Every other type previously defined
// here has a real home under types/modules/* or types/reusable/*; do not
// re-add anything other than the Seminars cluster below.

export interface Seminar {
    id: string;
    topic: string;
    description: string;
    date: string;
    venue: string;
    fee: number;
    maxParticipants?: number;
    status: 'active' | 'completed' | 'closed' | 'dissolved';
    registeredCount: number;
    /** Seminar type/track (e.g. "Technical & Automation Workshops"). Determines which seminar question set applies. */
    type: string;
    /** Auto-generated on creation. Stays reachable while status === 'active'. */
    registrationLink: string;
    createdAt?: string; // ISO date
}

export type SeminarParticipantStatus =
    | 'Pending Payment'
    | 'Registered'
    | 'Confirmed'
    | 'Attended'
    | 'Feedback Completed'
    | 'Certificate Sent'
    | 'Completed';

export interface SeminarPaymentInfo {
    status: 'Pending' | 'Paid' | 'Refunded' | 'Waived';
    date?: string;
    amount?: number;
    referenceNo?: string;
    remarks?: string;
}

/** Registration + fulfillment checklist shown on a participant's record. */
export interface SeminarProgress {
    registration: boolean;
    payment: boolean;
    seminarProper: boolean;
    feedbackForm: boolean;
    certificate: boolean;
}

/** Certificate details attached to a seminar participant record. */
export interface SeminarCertificate {
    issued: boolean;
    issuedDate?: string;
    certificateNo?: string;
    citationId?: string;
}

export interface SeminarParticipant {
    id: string;
    name: string;
    email: string;
    seminarTopic: string;
    status: SeminarParticipantStatus;
    certificate?: SeminarCertificate;
    /** Registration fields captured from the public registration form. */
    mobile?: string;
    location?: string;
    profession?: string;
    isStudent?: boolean;
    studentId?: string;
    registeredAt?: string; // ISO date
    progress?: SeminarProgress;
    payment?: SeminarPaymentInfo;
}

export type SeminarEmailKey =
    | 'acknowledgement'
    | 'payment_instructions'
    | 'successful_registration'
    | 'seminar_reminder'
    | 'feedback_request'
    | 'certificate_release';

/** Admin-configurable participant-facing email template, sent at each stage of the registration lifecycle. */
export interface SeminarEmailTemplate {
    id: string;
    key: SeminarEmailKey;
    name: string;
    trigger: string;
    subject: string;
    body: string;
    enabled: boolean;
    updatedAt?: string; // ISO date
}

export type SeminarAdminAlertKey =
    | 'new_registration'
    | 'feedback_submitted'
    | 'capacity_reached';

/** Admin-facing notification toggle (Email Notifications tab > Admin Notifications). */
export interface SeminarAdminAlertSetting {
    key: SeminarAdminAlertKey;
    label: string;
    description: string;
    enabled: boolean;
}
