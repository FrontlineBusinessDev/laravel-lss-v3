export type StatusKind =
    | 'active'
    | 'pending'
    | 'completed'
    | 'terminated'
    | 'archived'
    | 'declined'
    | 'dissolved'
    | 'suspended'
    | 'enabled'
    | 'disabled';

export interface Batch {
    id: string;
    batchNo: string;
    programType: string;
    industry: string;
    setup: 'F2F' | 'Online';
    trainees: number;
    status: StatusKind;
    started: string;
    projectedEnd: string;
    createdDate: string;
    registrationLink: string;
    dissolvedRemarks?: string;
}

export interface Trainee {
    id: string;
    first_name: string;
    last_name: string;
    name?: string;
    initials: string;
    school: string;
    batchNo: string;
    requiredHrs: number;
    completedHrs: number;
    status: StatusKind;
    endDate: string;
    documentsComplete: boolean;
    missingDocuments?: string[];
    archived?: boolean;
    statusBeforeArchive?: StatusKind;
    /** When true, admin has granted this trainee access to the evaluation form despite incomplete documents. */
    evaluationAccessOverride?: boolean;

    // Search / filter / list metadata
    email: string;
    academicProgram: string;
    academicLevel: string;
    programType: string;
    industry: string;

    // Personal information
    birthDate: string;
    birthPlace: string;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    mobileNumber: string;
    landlineNumber?: string;
    emergencyContactName: string;
    emergencyContactNumber: string;

    // Academic / internship information
    dateStarted: string;
    dateCompleted: string;
    terminationRemarks?: string;

    // Documents
    documents: TraineeDocument[];

    // Learning outcomes achieved (ids from learningOutcomes)
    achievedOutcomeIds: string[];

    // Payment details
    payments: TraineePayment[];
    totalAmount: number;
    totalDiscountAmount: number;
    discountPercentage: number;
    /** True once an admin has manually overridden the auto-computed totals/discount for this trainee. */
    paymentManuallyAdjusted?: boolean;
    paymentAdjustedBy?: string;
    paymentAdjustedAt?: string;

    // Ratings
    taskRatings: TraineeTaskRating[];
    behavioralRating?: {
        rating: number;
        comments: string;
    };

    // Certificate
    certificate?: TraineeCertificate;
}

export type DocumentKey =
    | 'resume'
    | 'endorsementLetter'
    | 'moa'
    | 'liabilityWaiver'
    | 'scannedEvaluation';

export interface TraineeDocument {
    key: DocumentKey;
    label: string;
    optional: boolean;
    link?: string;
    submittedAt?: string;
}

export interface TraineePayment {
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
    receiptNo: string;
    remarks?: string;
    recordedBy: string;
    invoiceLink?: string;
    acknowledgementReceiptLink?: string;
}

export type PaymentStatus =
    'Unpaid' | 'Partially paid' | 'Fully paid' | 'Overpaid';

/** A volume-based pricing tier: the per-hour training fee applied once a school reaches a given trainee headcount. */
export interface PricingTier {
    id: string;
    minTrainees: number;
    maxTrainees?: number; // undefined = no upper bound
    ratePerHour: number;
    label: string;
}

/** A predefined discount agreement/promotional rate tied to a partner school. */
export interface SchoolAgreement {
    schoolName: string;
    discountPercentage: number;
    note?: string;
}

export interface PaymentBreakdown {
    totalAmount: number;
    discountPercentage: number;
    totalDiscountAmount: number;
    netAmountDue: number;
    totalAmountPaid: number;
    outstandingBalance: number;
    status: PaymentStatus;
}

export interface TraineeTaskRating {
    id: string;
    taskName: string;
    rating: number; // 1–100
    evaluator: string;
    comments: string;
}

export interface TraineeCertificate {
    issued: boolean;
    issuedDate?: string;
    certificateNo: string;
    /** The citation (from the Certificate > Citation tab) rendered on this certificate. */
    citationId?: string;
}

/**
 * A reusable citation/write-up used when generating certificates (Certificate page
 * > Citation tab). Supports placeholder tokens — {{name}}, {{program}}, {{industry}},
 * {{hours}}, {{school}}, {{dateStarted}}, {{dateCompleted}}, {{seminarTopic}}, {{date}} —
 * which are substituted per-recipient at generation/print time.
 */
export interface CertificateCitation {
    id: string;
    title: string;
    /** Which certificate type(s) this citation may be used for. */
    appliesTo: 'Trainee' | 'Seminar' | 'Both';
    bodyText: string;
    status: 'active' | 'archived';
    /** Critical citations (already used on issued certificates) are protected from permanent deletion. */
    critical?: boolean;
    createdBy?: string;
    createdAt?: string; // ISO date
    updatedAt?: string; // ISO date
}

/** Certificate details attached to a seminar participant record. */
export interface SeminarCertificate {
    issued: boolean;
    issuedDate?: string;
    certificateNo?: string;
    citationId?: string;
}

export type LeaveType =
    | 'Sick Leave'
    | 'Vacation Leave'
    | 'School-Related Leave'
    | 'Bereavement Leave';
export type LeaveStatus = 'pending' | 'approved' | 'declined';

export interface LeaveDocument {
    name: string;
    link: string;
}

export interface LeaveRecord {
    id: string;
    traineeId: string;
    traineeName: string;
    initials: string;
    batchNo: string;
    school: string;
    leaveType: LeaveType;
    leaveDate: string; // ISO date, first day of leave
    returnDate: string; // ISO date, day trainee returns
    remarks: string; // trainee's stated reason for the leave
    status: LeaveStatus;
    dateSubmitted: string; // ISO date
    supportingDocuments?: LeaveDocument[];
    decisionRemarks?: string; // admin's remarks — required on decline, optional on approve
    decidedBy?: string;
    decisionDate?: string;
}

export type NotificationAudience = 'admin' | 'trainee';

/**
 * In-app notification. Admin notifications back the notification bell;
 * trainee notifications are recorded for completeness even though this
 * admin console has no trainee-facing surface to render them in.
 */
export interface AppNotification {
    id: string;
    audience: NotificationAudience;
    title: string;
    body: string;
    createdAt: string; // ISO date
    read: boolean;
    link?: string;
    relatedLeaveId?: string;
    type?: string;
    data?: Record<string, unknown> | null;
}

export interface TaskItem {
    id: string;
    title: string;
    dueDate: string;
    assignee: string;
    status: 'pending' | 'in_progress' | 'done';
}

export type AnnouncementAudience =
    | 'All trainees'
    | 'Specific batch'
    | 'Trainees with incomplete documents'
    | 'Custom group';

// export interface Announcement {
//     id: string;
//     title: string;
//     body: string;
//     postedBy: string;
//     postedAt: string;
//     subject: string;
//     description: string;
//     audience: AnnouncementAudience;
//     batchNo?: string; // when audience === 'Specific batch'
//     groupTraineeNames?: string[]; // when audience === 'Custom group'
//     recipientCount: number;
//     status: Extract<StatusKind, 'active' | 'archived'>;
// }

export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'batch' | 'evaluation' | 'holiday' | 'meeting' | 'leave' | 'task';
}

export interface PartnerSchool {
    id: string;
    name: string;
    abbr: string;
    logoUrl?: string;
    contactPerson: string;
    email: string;
    address: string;
    trainees: number;
    status: 'active' | 'archived';
}

export interface Industry {
    id: string;
    name: string;
    matchedPrograms: string[];
    batches: number;
    status: 'active' | 'archived';
}

export interface AcademicLevel {
    id: string;
    level: string;
    yearLevel: string;
    description: string;
    status: 'active' | 'archived';
}

export interface AcademicProgram {
    id: string;
    program: string;
    course: string;
    specialization: string;
    status: 'active' | 'archived';
}

export interface LearningOutcome {
    id: string;
    outcome: string;
    industry: string;
    status: 'active' | 'archived';
}

export interface TaskRecord {
    id: string;
    batchNo: string;
    task: string;
    description: string;
    timeGoal: number;
    timeSpent: number;
    trainee: string;
    trainer: string;
    date: string;
    status: 'open' | 'completed' | 'locked';
    onLeave: boolean;
    leaveReason?: string;
    remarks?: string;
}

/** A single edit captured in a task rating's audit trail. */
export interface TaskRatingHistoryEntry {
    rating: number;
    comments: string;
    evaluator: string;
    ratedAt: string; // ISO date
}

/**
 * A rating given to one trainee, for one task/project, within one batch.
 * Keyed by (batchNo, taskName, traineeId) — only one "current" rating exists
 * per combination, but every save is appended to `history` so it can be
 * reviewed later (per the "view task rating history" requirement).
 */
export interface TaskRating {
    id: string;
    batchNo: string;
    taskName: string;
    traineeId: string;
    traineeName: string;
    rating: number; // 1–100
    comments: string;
    evaluator: string;
    ratedAt: string; // ISO date of the most recent save
    history: TaskRatingHistoryEntry[];
}

export interface Seminar {
    id: string;
    topic: string;
    description: string;
    date: string;
    venue: string;
    fee: number;
    max_participants?: number;
    status: 'active' | 'completed' | 'closed' | 'dissolved';
    registered_count: number;
    /** Seminar type/track (e.g. "Technical & Automation Workshops"). Determines which seminar question set applies. */
    type: string;
    /** Auto-generated on creation. Stays reachable while status === 'active'. */
    registration_link: string;
    createdAt?: string; // ISO date
    is_public_url_enable: boolean;
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
    'new_registration' | 'feedback_submitted' | 'capacity_reached';

/** Admin-facing notification toggle (Email Notifications tab > Admin Notifications). */
export interface SeminarAdminAlertSetting {
    key: SeminarAdminAlertKey;
    label: string;
    description: string;
    enabled: boolean;
}

export interface EvaluationQuestion {
    id: string;
    question: string;
    category: 'Trainer' | 'Seminar';
    /**
     * Which question set this belongs to within its category — e.g. "Information Technology" /
     * "Accounting" for Trainer questions, or a seminar track name for Seminar questions. Sets are
     * fully admin-defined and scalable beyond just two per category.
     */
    questionSet: string;
    /** Optional grouping label shown as a section header above this question. */
    section?: string;
    /** 'rating' questions are answered on a 1-5 scale; 'text' questions collect a written answer. */
    type: 'rating' | 'text';
    status: 'active' | 'archived';
    /** Critical questions (e.g. required for accreditation) are protected from permanent deletion. */
    critical?: boolean;
    createdBy?: string;
    createdAt?: string; // ISO date
    updatedAt?: string; // ISO date
}

/** A single answer within a submitted evaluation, tied back to the question that was asked. */
export interface EvaluationAnswer {
    questionId: string;
    question: string;
    section?: string;
    type: 'rating' | 'text';
    value: number | string;
}

/**
 * A single evaluation submission: a trainee assessing the trainer who supervised
 * them (category 'Trainer', scoped to a batch), or a seminar participant assessing
 * the resource speaker (category 'Seminar', scoped to a seminar topic).
 */
export interface EvaluationResponse {
    id: string;
    category: 'Trainer' | 'Seminar';
    batchNo?: string; // set when category === 'Trainer'
    seminarTopic?: string; // set when category === 'Seminar'
    /** The question set answered against (e.g. "Information Technology", "Accounting", or a seminar track). */
    questionSet?: string;
    respondentId: string;
    respondentName: string;
    /** Name of the trainer or resource speaker being evaluated. */
    targetName: string;
    averageScore: number; // 1–5
    answeredCount: number;
    submittedAt: string; // ISO date
    status: 'active' | 'archived';
    /** Critical records (e.g. tied to an issued certificate) are protected from permanent deletion. */
    critical?: boolean;
    /** Full per-question breakdown for this submission, shown when drilling into an individual response. */
    answers?: EvaluationAnswer[];
}

/**
 * The six sections of the Trainer Evaluation for Trainees questionnaire.
 * Sections I–IV are rated statements; V and VI collect written feedback.
 */
export type BehavioralSection =
    | 'I. Work Performance & Discipline'
    | 'II. Learning Ability & Technical Growth'
    | 'III. Teamwork & Professional Behavior'
    | 'IV. Technical Competency & Job Readiness'
    | "V. Trainer's General Evaluation of the Trainee"
    | 'VI. Written Feedback';

/**
 * A single item in the behavioral / professionalism question bank used by
 * the Behavioral Assessment Form, grouped into sections. 'rating' items are
 * scored on the standard 1–5 scale; 'text' items collect a written response
 * (short notes for Section V, full paragraphs for Section VI).
 */
export interface BehavioralQuestion {
    id: string;
    section: BehavioralSection;
    question: string;
    type: 'rating' | 'text';
    order: number;
    status: 'active' | 'archived';
}

export interface BehavioralAnswer {
    questionId: string;
    score?: number; // 1–5, for 'rating' questions
    text?: string; // for 'text' questions
}

export interface BehavioralRatingHistoryEntry {
    answers: BehavioralAnswer[];
    overallComments: string;
    recommendation: string;
    evaluator: string;
    ratedAt: string; // ISO date
}

/**
 * A trainee's behavioral / workplace-professionalism evaluation for a batch.
 * One "current" evaluation exists per (batchNo, traineeId), with every save
 * appended to `history` so previous submissions stay reviewable.
 */
export interface BehavioralRating {
    id: string;
    batchNo: string;
    traineeId: string;
    traineeName: string;
    answers: BehavioralAnswer[];
    overallComments: string;
    recommendation: string;
    evaluator: string;
    ratedAt: string; // ISO date of the most recent save
    history: BehavioralRatingHistoryEntry[];
}

export interface AppUser {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role:
        | 'Administrator'
        | 'Program coordinator'
        | 'Trainer'
        | 'Finance'
        | 'Trainee';
    status: 'active' | 'pending' | 'suspended' | 'archived';
    isTraineeAccount?: boolean;
}
