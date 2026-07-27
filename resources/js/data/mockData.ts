import type {
  Seminar,
  SeminarParticipant,
  SeminarEmailTemplate,
  SeminarAdminAlertSetting,
} from '@/types'

// Remaining on purpose: Seminars admin is still mock-backed pending a real
// CRUD backend (deferred — see memory). Every other module previously mocked
// here has been converted to real, backend-driven data; do not re-add
// exports for anything other than the Seminars cluster below.

/** Fixed "today" so the Seminars demo data (progress calcs, etc.) stays consistent. */
export const TODAY = new Date('2026-07-01')

function seminarRegLink(topic: string) {
  return `https://register.fbs-lss.com/seminars/${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

export const seminars: Seminar[] = [
  { id: 'sem1', topic: 'Automating with n8n: Smarter Workflows with AI', description: 'Hands-on webinar covering n8n, Gemini, and API automation.', date: '2026-06-27', venue: 'Online (Google Meet)', fee: 500, maxParticipants: 100, status: 'completed', registeredCount: 84, type: 'Technical & Automation Workshops', registrationLink: seminarRegLink('Automating with n8n'), createdAt: '2026-06-10' },
  { id: 'sem2', topic: 'Intro to Data Privacy for HR Teams', description: 'Seminar on Data Privacy Act compliance for HR practitioners.', date: '2026-07-18', venue: 'FBS Training Room, Makati', fee: 750, maxParticipants: 40, status: 'active', registeredCount: 22, type: 'Compliance & Softskills Seminars', registrationLink: seminarRegLink('Intro to Data Privacy for HR Teams'), createdAt: '2026-06-25' },
  { id: 'sem3', topic: 'Effective People Management for New Supervisors', description: 'Softskills workshop on coaching, delegation, and performance conversations.', date: '2026-08-02', venue: 'Online (Google Meet)', fee: 600, maxParticipants: 60, status: 'active', registeredCount: 9, type: 'Compliance & Softskills Seminars', registrationLink: seminarRegLink('Effective People Management'), createdAt: '2026-07-01' },
  { id: 'sem4', topic: 'Excel Automation with Power Query', description: 'Technical workshop on building repeatable Excel data pipelines.', date: '2026-05-14', venue: 'FBS Training Room, Makati', fee: 500, maxParticipants: 50, status: 'closed', registeredCount: 50, type: 'Technical & Automation Workshops', registrationLink: seminarRegLink('Excel Automation with Power Query'), createdAt: '2026-04-20' },
  { id: 'sem5', topic: 'Basic Occupational Safety Orientation', description: 'Compliance orientation cancelled due to low turnout.', date: '2026-04-30', venue: 'Online (Google Meet)', fee: 0, status: 'dissolved', registeredCount: 3, type: 'Compliance & Softskills Seminars', registrationLink: seminarRegLink('Basic Occupational Safety Orientation'), createdAt: '2026-04-01' },
]

export const seminarParticipants: SeminarParticipant[] = [
  {
    id: 'sp1', name: 'Carla Dizon', email: 'carla.dizon@example.com', mobile: '0917 214 5590', location: 'Quezon City', profession: 'HR Specialist', isStudent: false,
    seminarTopic: 'Automating with n8n: Smarter Workflows with AI', status: 'Certificate Sent', registeredAt: '2026-06-11',
    certificate: { issued: true, issuedDate: '2026-06-28', certificateNo: 'SEM-2026-0031', citationId: 'cit3' },
    progress: { registration: true, payment: true, seminarProper: true, feedbackForm: true, certificate: true },
    payment: { status: 'Paid', date: '2026-06-12', amount: 500, referenceNo: 'GC-88213041', remarks: 'Paid via GCash' },
  },
  {
    id: 'sp2', name: 'Miguel Torres', email: 'miguel.torres@example.com', mobile: '0918 402 7761', location: 'Pasig City', profession: 'Operations Analyst', isStudent: false,
    seminarTopic: 'Automating with n8n: Smarter Workflows with AI', status: 'Feedback Completed', registeredAt: '2026-06-13',
    certificate: { issued: false, certificateNo: 'SEM-2026-0032' },
    progress: { registration: true, payment: true, seminarProper: true, feedbackForm: true, certificate: false },
    payment: { status: 'Paid', date: '2026-06-14', amount: 500, referenceNo: 'BPI-5521098', remarks: '' },
  },
  {
    id: 'sp3', name: 'Bea Fernandez', email: 'bea.fernandez@example.com', mobile: '0920 553 1187', location: 'Makati City', profession: 'HR Assistant', isStudent: false,
    seminarTopic: 'Intro to Data Privacy for HR Teams', status: 'Registered', registeredAt: '2026-06-27',
    progress: { registration: true, payment: false, seminarProper: false, feedbackForm: false, certificate: false },
    payment: { status: 'Pending' },
  },
  {
    id: 'sp4', name: 'John Rey Aquino', email: 'johnrey.aquino@example.com', mobile: '0906 771 2245', location: 'Taguig City', profession: 'Student', isStudent: true, studentId: '2023-0119-MN',
    seminarTopic: 'Intro to Data Privacy for HR Teams', status: 'Confirmed', registeredAt: '2026-06-29',
    progress: { registration: true, payment: true, seminarProper: false, feedbackForm: false, certificate: false },
    payment: { status: 'Paid', date: '2026-06-30', amount: 750, referenceNo: 'GC-91007733', remarks: 'Student rate honored' },
  },
  {
    id: 'sp5', name: 'Kristine Manalo', email: 'kristine.manalo@example.com', mobile: '0917 880 3312', location: 'Online', profession: 'Team Lead', isStudent: false,
    seminarTopic: 'Effective People Management for New Supervisors', status: 'Pending Payment', registeredAt: '2026-07-02',
    progress: { registration: true, payment: false, seminarProper: false, feedbackForm: false, certificate: false },
    payment: { status: 'Pending' },
  },
]

export const seminarEmailTemplates: SeminarEmailTemplate[] = [
  {
    id: 'set1', key: 'acknowledgement', name: 'Registration Acknowledgement', trigger: 'Sent immediately after registration.',
    subject: 'We received your registration for {{seminarTopic}}',
    body: 'Hi {{name}},\n\nThanks for registering for "{{seminarTopic}}" on {{seminarDate}}. We\'ll follow up shortly with payment instructions.\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-05-02',
  },
  {
    id: 'set2', key: 'payment_instructions', name: 'Payment Instructions', trigger: 'Sent when the admin requests payment.',
    subject: 'Complete your payment for {{seminarTopic}}',
    body: 'Hi {{name}},\n\nPlease settle your registration fee of PHP {{fee}} for "{{seminarTopic}}" via GCash or bank transfer, then reply with your reference number.\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-05-02',
  },
  {
    id: 'set3', key: 'successful_registration', name: 'Successful Registration', trigger: 'Sent after payment confirmation.',
    subject: "You're confirmed for {{seminarTopic}}",
    body: 'Hi {{name}},\n\nYour payment has been confirmed. You\'re officially registered for "{{seminarTopic}}" on {{seminarDate}} at {{venue}}. See you there!\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-05-02',
  },
  {
    id: 'set4', key: 'seminar_reminder', name: 'Seminar Reminder', trigger: 'Sent before the seminar date.',
    subject: 'Reminder: {{seminarTopic}} is coming up',
    body: 'Hi {{name}},\n\nThis is a reminder that "{{seminarTopic}}" is happening on {{seminarDate}} at {{venue}}. See you soon!\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-04-18',
  },
  {
    id: 'set5', key: 'feedback_request', name: 'Feedback Form Request', trigger: 'Sent after the seminar.',
    subject: 'How was {{seminarTopic}}?',
    body: 'Hi {{name}},\n\nThanks for attending "{{seminarTopic}}"! Please take a minute to complete the feedback form so we can issue your certificate.\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-04-18',
  },
  {
    id: 'set6', key: 'certificate_release', name: 'Certificate Release', trigger: "Sent when the participant's certificate is generated.",
    subject: 'Your certificate for {{seminarTopic}} is ready',
    body: 'Hi {{name}},\n\nYour certificate of attendance for "{{seminarTopic}}" is attached. Congratulations on completing the seminar!\n\n— FBS Learning Solutions System',
    enabled: true, updatedAt: '2026-04-18',
  },
]

export const seminarAdminAlerts: SeminarAdminAlertSetting[] = [
  { key: 'new_registration', label: 'New registration received', description: 'Notify all active admin users when a new registration is received.', enabled: true },
  { key: 'feedback_submitted', label: 'Feedback form submitted', description: 'Notify admins when a participant submits a feedback form.', enabled: true },
  { key: 'capacity_reached', label: 'Seminar capacity reached', description: 'Notify admins when a seminar reaches its maximum number of participants.', enabled: false },
]
