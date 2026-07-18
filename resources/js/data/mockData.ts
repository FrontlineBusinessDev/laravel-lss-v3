import type {
  Batch,
  Trainee,
  PartnerSchool,
  Industry,
  AcademicLevel,
  AcademicProgram,
  LearningOutcome,
  AppUser,
  LeaveRecord,
  TaskItem,
  Announcement,
  CalendarEvent,
  DocumentKey,
  TraineeDocument,
  BiometricRecord,
  BiometricImportBatch,
  TaskRecord,
  Seminar,
  SeminarParticipant,
  SeminarEmailTemplate,
  SeminarAdminAlertSetting,
  EvaluationQuestion,
  EvaluationAnswer,
  TaskRating,
  BehavioralQuestion,
  BehavioralRating,
  EvaluationResponse,
  PricingTier,
  SchoolAgreement,
  PaymentBreakdown,
  PaymentStatus,
  CertificateCitation,
} from '@/types'

/** Fixed "today" so dashboard demo data (nearing-end-date, calendar dots, etc.) stays consistent. */
export const TODAY = new Date('2026-07-01')

function regLink(batchNo: string) {
  return `https://register.lss-admin.app/b/${batchNo.toLowerCase()}`
}

export const batches: Batch[] = [
  { id: 'b1', batchNo: 'B-2026-042', programType: 'College OJT', industry: 'Information Technology', setup: 'F2F', trainees: 24, status: 'active', started: 'Apr 14, 2026', projectedEnd: 'Jul 5, 2026', createdDate: 'Apr 10, 2026', registrationLink: regLink('B-2026-042') },
  { id: 'b2', batchNo: 'B-2026-041', programType: 'Upskill training', industry: 'Accounting', setup: 'Online', trainees: 56, status: 'active', started: 'Apr 2, 2026', projectedEnd: 'Jun 20, 2026', createdDate: 'Mar 28, 2026', registrationLink: regLink('B-2026-041') },
  { id: 'b3', batchNo: 'B-2026-039', programType: 'Senior HS work immersion', industry: 'Information Technology', setup: 'F2F', trainees: 18, status: 'active', started: 'Mar 24, 2026', projectedEnd: 'Jun 1, 2026', createdDate: 'Mar 18, 2026', registrationLink: regLink('B-2026-039') },
  { id: 'b4', batchNo: 'B-2026-033', programType: 'Upskill training', industry: 'Accounting', setup: 'Online', trainees: 12, status: 'completed', started: 'Feb 10, 2026', projectedEnd: 'Mar 20, 2026', createdDate: 'Feb 4, 2026', registrationLink: regLink('B-2026-033') },
  { id: 'b5', batchNo: 'B-2026-028', programType: 'College OJT', industry: 'Information Technology', setup: 'F2F', trainees: 9, status: 'dissolved', started: 'Jan 15, 2026', projectedEnd: 'Apr 1, 2026', createdDate: 'Jan 8, 2026', registrationLink: regLink('B-2026-028'), dissolvedRemarks: 'Host company closed operations before completion.' },
  { id: 'b6', batchNo: 'B-2026-045', programType: 'College OJT', industry: 'Hospitality', setup: 'F2F', trainees: 31, status: 'pending', started: 'Jul 1, 2026', projectedEnd: 'Sep 20, 2026', createdDate: 'Jun 25, 2026', registrationLink: regLink('B-2026-045') },
  { id: 'b7', batchNo: 'B-2026-044', programType: 'Upskill training', industry: 'Marketing', setup: 'Online', trainees: 40, status: 'active', started: 'May 5, 2026', projectedEnd: 'Jun 25, 2026', createdDate: 'Apr 30, 2026', registrationLink: regLink('B-2026-044') },
  { id: 'b8', batchNo: 'B-2026-030', programType: 'Senior HS work immersion', industry: 'Hospitality', setup: 'F2F', trainees: 15, status: 'terminated', started: 'Jan 20, 2026', projectedEnd: 'Mar 15, 2026', createdDate: 'Jan 14, 2026', registrationLink: regLink('B-2026-030') },
  { id: 'b9', batchNo: 'B-2026-046', programType: 'College OJT', industry: 'Accounting', setup: 'F2F', trainees: 21, status: 'active', started: 'Apr 20, 2026', projectedEnd: 'Jul 10, 2026', createdDate: 'Apr 15, 2026', registrationLink: regLink('B-2026-046') },
  { id: 'b10', batchNo: 'B-2026-047', programType: 'Upskill training', industry: 'Information Technology', setup: 'Online', trainees: 17, status: 'active', started: 'May 12, 2026', projectedEnd: 'Jul 13, 2026', createdDate: 'May 6, 2026', registrationLink: regLink('B-2026-047') },
]

function makeDocuments(overrides: Partial<Record<DocumentKey, { link?: string; submittedAt?: string }>>): TraineeDocument[] {
  const defs: { key: DocumentKey; label: string; optional: boolean }[] = [
    { key: 'resume', label: 'Resume', optional: false },
    { key: 'endorsementLetter', label: 'Endorsement letter', optional: true },
    { key: 'moa', label: 'Memorandum of Agreement (MOA)', optional: false },
    { key: 'liabilityWaiver', label: 'Liability waiver', optional: false },
    { key: 'scannedEvaluation', label: 'Scanned evaluation', optional: false },
  ]
  return defs.map((d) => ({ ...d, ...overrides[d.key] }))
}

export const trainees: Trainee[] = [
  {
    id: 't1', name: 'Maria Santos', initials: 'MS', school: 'STI College', batchNo: 'B-2026-042',
    requiredHrs: 486, completedHrs: 312, status: 'active', endDate: '2026-07-05', documentsComplete: true,
    email: 'maria.santos@sti.edu.ph', academicProgram: 'BS Computer Science', academicLevel: '4th year',
    programType: 'College OJT', industry: 'Information Technology',
    birthDate: '2004-03-12', birthPlace: 'Quezon City', gender: 'Female', address: '24 Malakas St., Diliman, Quezon City',
    mobileNumber: '0917 234 5566', landlineNumber: '(02) 8925 1122', emergencyContactName: 'Elena Santos', emergencyContactNumber: '0917 234 5599',
    dateStarted: '2026-04-14', dateCompleted: '2026-07-05',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/msantos-resume', submittedAt: '2026-04-10' },
      moa: { link: 'https://drive.example.com/msantos-moa', submittedAt: '2026-04-11' },
      liabilityWaiver: { link: 'https://drive.example.com/msantos-waiver', submittedAt: '2026-04-11' },
      scannedEvaluation: { link: 'https://drive.example.com/msantos-eval', submittedAt: '2026-06-28' },
    }),
    achievedOutcomeIds: ['o1'],
    payments: [{ id: 'pay1', date: '2026-04-12', amount: 3000, method: 'Bank transfer', reference: 'REF-88213', receiptNo: 'OR-2026-0142', recordedBy: 'Bea Villanueva' }],
    totalAmount: 5000, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [
      { id: 'tr1', taskName: 'Network configuration exercise', rating: 90, evaluator: 'Carlo Jimenez', comments: 'Solid grasp of subnetting fundamentals.' },
      { id: 'tr2', taskName: 'Helpdesk ticket handling', rating: 84, evaluator: 'Carlo Jimenez', comments: 'Responsive and organized in resolving tickets.' },
    ],
    behavioralRating: { rating: 4.6, comments: 'Punctual, proactive, and works well with the team.' },
    certificate: { issued: false, certificateNo: 'CERT-2026-0142' },
  },
  {
    id: 't2', name: 'Jared Cruz', initials: 'JC', school: 'AMA University', batchNo: 'B-2026-042',
    requiredHrs: 486, completedHrs: 460, status: 'active', endDate: '2026-07-03', documentsComplete: false, missingDocuments: ['Endorsement letter', 'Scanned evaluation'],
    email: 'jared.cruz@ama.edu.ph', academicProgram: 'BS Information Technology', academicLevel: '4th year',
    programType: 'College OJT', industry: 'Information Technology',
    birthDate: '2003-11-02', birthPlace: 'Caloocan City', gender: 'Male', address: '15 Rizal Ave., Caloocan City',
    mobileNumber: '0918 445 2210', emergencyContactName: 'Rowena Cruz', emergencyContactNumber: '0918 445 2299',
    dateStarted: '2026-04-14', dateCompleted: '2026-07-03',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/jcruz-resume', submittedAt: '2026-04-09' },
      moa: { link: 'https://drive.example.com/jcruz-moa', submittedAt: '2026-04-11' },
      liabilityWaiver: { link: 'https://drive.example.com/jcruz-waiver', submittedAt: '2026-04-11' },
    }),
    achievedOutcomeIds: ['o1', 'o3'],
    payments: [
      { id: 'pay2', date: '2026-04-10', amount: 2500, method: 'GCash', reference: 'REF-77102', receiptNo: 'OR-2026-0143', recordedBy: 'Bea Villanueva' },
      { id: 'pay3', date: '2026-05-15', amount: 2500, method: 'GCash', reference: 'REF-77340', receiptNo: 'OR-2026-0198', recordedBy: 'Bea Villanueva' },
    ],
    totalAmount: 5000, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [
      { id: 'tr3', taskName: 'Network configuration exercise', rating: 96, evaluator: 'Carlo Jimenez', comments: 'Consistently exceeds expectations on technical tasks.' },
    ],
    behavioralRating: { rating: 4.3, comments: 'Reliable, though occasionally submits reports late.' },
    certificate: { issued: false, certificateNo: 'CERT-2026-0143' },
  },
  {
    id: 't3', name: 'Paolo Diaz', initials: 'PD', school: 'PUP', batchNo: 'B-2026-028',
    requiredHrs: 486, completedHrs: 88, status: 'terminated', endDate: '2026-04-01', documentsComplete: true,
    email: 'paolo.diaz@pup.edu.ph', academicProgram: 'BS Computer Science', academicLevel: '3rd year',
    programType: 'College OJT', industry: 'Information Technology',
    birthDate: '2004-07-19', birthPlace: 'Manila', gender: 'Male', address: '88 Taft Ave., Manila',
    mobileNumber: '0919 332 1187', emergencyContactName: 'Rico Diaz', emergencyContactNumber: '0919 332 1199',
    dateStarted: '2026-01-15', dateCompleted: '2026-04-01', terminationRemarks: 'Batch dissolved due to host company closure; trainee did not complete required hours.',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/pdiaz-resume', submittedAt: '2026-01-10' },
      moa: { link: 'https://drive.example.com/pdiaz-moa', submittedAt: '2026-01-12' },
      liabilityWaiver: { link: 'https://drive.example.com/pdiaz-waiver', submittedAt: '2026-01-12' },
      scannedEvaluation: { link: 'https://drive.example.com/pdiaz-eval', submittedAt: '2026-04-02' },
    }),
    achievedOutcomeIds: [],
    payments: [{ id: 'pay4', date: '2026-01-13', amount: 5000, method: 'Cash', reference: 'REF-60021', receiptNo: 'OR-2026-0055', recordedBy: 'Bea Villanueva' }],
    totalAmount: 5000, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [{ id: 'tr4', taskName: 'Basic hardware diagnostics', rating: 64, evaluator: 'Carlo Jimenez', comments: 'Limited exposure due to early batch dissolution.' }],
    certificate: { issued: false, certificateNo: 'CERT-2026-0055' },
  },
  {
    id: 't4', name: 'Angela Reyes', initials: 'AR', school: 'FEU', batchNo: 'B-2026-033',
    requiredHrs: 486, completedHrs: 486, status: 'completed', endDate: '2026-03-20', documentsComplete: true,
    email: 'angela.reyes@feu.edu.ph', academicProgram: 'BS Accountancy', academicLevel: '4th year',
    programType: 'Upskill training', industry: 'Accounting',
    birthDate: '2003-09-05', birthPlace: 'Pasay City', gender: 'Female', address: '10 EDSA Ext., Pasay City',
    mobileNumber: '0920 556 7788', landlineNumber: '(02) 8551 3344', emergencyContactName: 'Marites Reyes', emergencyContactNumber: '0920 556 7799',
    dateStarted: '2026-02-10', dateCompleted: '2026-03-20',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/areyes-resume', submittedAt: '2026-02-05' },
      endorsementLetter: { link: 'https://drive.example.com/areyes-endorsement', submittedAt: '2026-02-06' },
      moa: { link: 'https://drive.example.com/areyes-moa', submittedAt: '2026-02-07' },
      liabilityWaiver: { link: 'https://drive.example.com/areyes-waiver', submittedAt: '2026-02-07' },
      scannedEvaluation: { link: 'https://drive.example.com/areyes-eval', submittedAt: '2026-03-19' },
    }),
    achievedOutcomeIds: ['o2'],
    payments: [{ id: 'pay5', date: '2026-02-08', amount: 4000, method: 'Bank transfer', reference: 'REF-51290', receiptNo: 'OR-2026-0090', recordedBy: 'Bea Villanueva', invoiceLink: 'https://drive.example.com/areyes-invoice-0090', acknowledgementReceiptLink: 'https://drive.example.com/areyes-ar-0090' }],
    totalAmount: 4000, totalDiscountAmount: 400, discountPercentage: 10,
    taskRatings: [{ id: 'tr5', taskName: 'Financial statement preparation', rating: 98, evaluator: 'Bea Villanueva', comments: 'Outstanding attention to detail and accuracy.' }],
    behavioralRating: { rating: 4.8, comments: 'Excellent professionalism throughout the program.' },
    certificate: { issued: true, issuedDate: '2026-03-22', certificateNo: 'CERT-2026-0090', citationId: 'cit1' },
  },
  {
    id: 't5', name: 'Kevin Lopez', initials: 'KL', school: 'STI College', batchNo: 'B-2026-046',
    requiredHrs: 486, completedHrs: 0, status: 'pending', endDate: '2026-07-10', documentsComplete: false, missingDocuments: ['Resume', 'MOA', 'Liability waiver'],
    email: 'kevin.lopez@sti.edu.ph', academicProgram: 'BS Accountancy', academicLevel: '3rd year',
    programType: 'College OJT', industry: 'Accounting',
    birthDate: '2004-12-01', birthPlace: 'Marikina City', gender: 'Male', address: '5 Sumulong Hwy., Marikina City',
    mobileNumber: '0921 664 3321', emergencyContactName: 'Fe Lopez', emergencyContactNumber: '0921 664 3399',
    dateStarted: '2026-07-01', dateCompleted: '2026-09-25',
    documents: makeDocuments({}),
    achievedOutcomeIds: [],
    payments: [],
    totalAmount: 5000, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [],
    certificate: { issued: false, certificateNo: 'CERT-2026-0210' },
  },
  {
    id: 't6', name: 'Bianca Torres', initials: 'BT', school: 'AMA University', batchNo: 'B-2026-046',
    requiredHrs: 486, completedHrs: 402, status: 'active', endDate: '2026-07-10', documentsComplete: true,
    email: 'bianca.torres@ama.edu.ph', academicProgram: 'BS Accountancy', academicLevel: '4th year',
    programType: 'College OJT', industry: 'Accounting',
    birthDate: '2004-02-27', birthPlace: 'Pasig City', gender: 'Female', address: '77 Ortigas Ave., Pasig City',
    mobileNumber: '0922 887 1234', emergencyContactName: 'Noel Torres', emergencyContactNumber: '0922 887 1299',
    dateStarted: '2026-04-20', dateCompleted: '2026-07-10',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/btorres-resume', submittedAt: '2026-04-16' },
      moa: { link: 'https://drive.example.com/btorres-moa', submittedAt: '2026-04-17' },
      liabilityWaiver: { link: 'https://drive.example.com/btorres-waiver', submittedAt: '2026-04-17' },
      scannedEvaluation: { link: 'https://drive.example.com/btorres-eval', submittedAt: '2026-06-30' },
    }),
    achievedOutcomeIds: ['o2'],
    payments: [{ id: 'pay6', date: '2026-04-18', amount: 5000, method: 'GCash', reference: 'REF-90341', receiptNo: 'OR-2026-0166', recordedBy: 'Bea Villanueva' }],
    totalAmount: 5000, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [{ id: 'tr6', taskName: 'Accounts reconciliation', rating: 88, evaluator: 'Bea Villanueva', comments: 'Careful and methodical worker.' }],
    behavioralRating: { rating: 4.5, comments: 'Good communicator, coordinates well with the team.' },
    certificate: { issued: false, certificateNo: 'CERT-2026-0166' },
  },
  {
    id: 't7', name: 'Ryan Aquino', initials: 'RA', school: 'DLSU', batchNo: 'B-2026-047',
    requiredHrs: 486, completedHrs: 388, status: 'active', endDate: '2026-07-13', documentsComplete: false, missingDocuments: ['Resume', 'Memorandum of Agreement (MOA)'],
    email: 'ryan.aquino@dlsu.edu.ph', academicProgram: 'BS Information Technology', academicLevel: '4th year',
    programType: 'Upskill training', industry: 'Information Technology',
    birthDate: '2003-05-30', birthPlace: 'Manila', gender: 'Male', address: '2401 Taft Ave., Manila',
    mobileNumber: '0923 112 4455', emergencyContactName: 'Grace Aquino', emergencyContactNumber: '0923 112 4499',
    dateStarted: '2026-05-12', dateCompleted: '2026-07-13',
    documents: makeDocuments({
      liabilityWaiver: { link: 'https://drive.example.com/raquino-waiver', submittedAt: '2026-05-08' },
      scannedEvaluation: { link: 'https://drive.example.com/raquino-eval', submittedAt: '2026-06-29' },
    }),
    achievedOutcomeIds: ['o1'],
    payments: [{ id: 'pay7', date: '2026-05-09', amount: 3000, method: 'Bank transfer', reference: 'REF-40218', receiptNo: 'OR-2026-0177', recordedBy: 'Bea Villanueva' }],
    totalAmount: 5000, totalDiscountAmount: 500, discountPercentage: 10,
    taskRatings: [{ id: 'tr7', taskName: 'Server maintenance drill', rating: 82, evaluator: 'Carlo Jimenez', comments: 'Needs more confidence handling client-facing issues.' }],
    behavioralRating: { rating: 4.0, comments: 'Generally cooperative, still adjusting to team pace.' },
    certificate: { issued: false, certificateNo: 'CERT-2026-0177' },
  },
  {
    id: 't8', name: 'Sofia Mendoza', initials: 'SM', school: 'UST', batchNo: 'B-2026-039',
    requiredHrs: 486, completedHrs: 470, status: 'active', endDate: '2026-06-01', documentsComplete: true,
    email: 'sofia.mendoza@ust.edu.ph', academicProgram: 'BS Information Technology', academicLevel: 'Grade 12',
    programType: 'Senior HS work immersion', industry: 'Information Technology',
    birthDate: '2008-01-22', birthPlace: 'Sampaloc, Manila', gender: 'Female', address: '99 España Blvd., Manila',
    mobileNumber: '0924 771 5566', emergencyContactName: 'Liwayway Mendoza', emergencyContactNumber: '0924 771 5599',
    dateStarted: '2026-03-24', dateCompleted: '2026-06-01',
    documents: makeDocuments({
      resume: { link: 'https://drive.example.com/smendoza-resume', submittedAt: '2026-03-20' },
      endorsementLetter: { link: 'https://drive.example.com/smendoza-endorsement', submittedAt: '2026-03-20' },
      moa: { link: 'https://drive.example.com/smendoza-moa', submittedAt: '2026-03-21' },
      liabilityWaiver: { link: 'https://drive.example.com/smendoza-waiver', submittedAt: '2026-03-21' },
      scannedEvaluation: { link: 'https://drive.example.com/smendoza-eval', submittedAt: '2026-05-30' },
    }),
    achievedOutcomeIds: ['o1'],
    payments: [],
    totalAmount: 0, totalDiscountAmount: 0, discountPercentage: 0,
    taskRatings: [{ id: 'tr8', taskName: 'Basic hardware diagnostics', rating: 92, evaluator: 'Carlo Jimenez', comments: 'Very eager to learn, picks up new tools quickly.' }],
    behavioralRating: { rating: 4.7, comments: 'Mature and respectful for her age group.' },
    certificate: { issued: false, certificateNo: 'CERT-2026-0128' },
  },
]

/** Derives the display status (Active/Inactive) for a trainee based on their assigned batch's status. */
export function getTraineeBatchStatus(trainee: Trainee): 'Active' | 'Inactive' {
  const batch = batches.find((b) => b.batchNo === trainee.batchNo)
  return batch?.status === 'active' ? 'Active' : 'Inactive'
}

export const partnerSchools: PartnerSchool[] = [
  { id: 's1', name: 'STI College', abbr: 'STI', contactPerson: 'Angela Fernandez', email: 'a.fernandez@sti.edu.ph', address: '2/F STI Building, Quezon Avenue, Quezon City', trainees: 38, status: 'active' },
  { id: 's2', name: 'AMA University', abbr: 'AMA', contactPerson: 'Ronald Buenaventura', email: 'r.buenaventura@ama.edu.ph', address: '1105 Brixton St, Pasig City', trainees: 26, status: 'active' },
  { id: 's3', name: 'Polytechnic University of the Philippines', abbr: 'PUP', contactPerson: 'Liza Manalastas', email: 'l.manalastas@pup.edu.ph', address: 'Anonas St, Sta. Mesa, Manila', trainees: 19, status: 'active' },
  { id: 's4', name: 'Far Eastern University', abbr: 'FEU', contactPerson: 'Carlo Mendiola', email: 'c.mendiola@feu.edu.ph', address: 'Nicanor Reyes St, Sampaloc, Manila', trainees: 0, status: 'archived' },
  { id: 's5', name: 'De La Salle University', abbr: 'DLSU', contactPerson: 'Patricia Aguinaldo', email: 'p.aguinaldo@dlsu.edu.ph', address: '2401 Taft Avenue, Malate, Manila', trainees: 14, status: 'active' },
  { id: 's6', name: 'University of Santo Tomas', abbr: 'UST', contactPerson: 'Michael Ocampo', email: 'm.ocampo@ust.edu.ph', address: 'España Blvd, Sampaloc, Manila', trainees: 8, status: 'active' },
]

export const industries: Industry[] = [
  { id: 'i1', name: 'Information technology', matchedPrograms: ['College OJT', 'Senior HS work immersion', 'Upskill training'], batches: 9, status: 'active' },
  { id: 'i2', name: 'Accounting', matchedPrograms: ['College OJT', 'Upskill training'], batches: 5, status: 'active' },
  { id: 'i3', name: 'Hospitality', matchedPrograms: ['College OJT', 'Senior HS work immersion'], batches: 3, status: 'active' },
  { id: 'i4', name: 'Marketing', matchedPrograms: ['Upskill training'], batches: 2, status: 'active' },
  { id: 'i5', name: 'Engineering', matchedPrograms: ['College OJT'], batches: 0, status: 'archived' },
]

export const academicLevels: AcademicLevel[] = [
  { id: 'l1', level: 'College', yearLevel: '4th year', description: 'Undergraduate, final year students', status: 'active' },
  { id: 'l2', level: 'Senior high school', yearLevel: 'Grade 12', description: 'Work immersion track', status: 'active' },
  { id: 'l3', level: 'College', yearLevel: '3rd year', description: 'Undergraduate, pre-final year', status: 'active' },
  { id: 'l4', level: 'Vocational', yearLevel: 'Year 2', description: 'TESDA-aligned vocational track', status: 'active' },
  { id: 'l5', level: 'College', yearLevel: '2nd year', description: 'No longer used for placements', status: 'archived' },
]

export const academicPrograms: AcademicProgram[] = [
  { id: 'p1', program: 'Information technology', course: 'BS Computer Science', specialization: 'Software engineering', status: 'active' },
  { id: 'p2', program: 'Accountancy', course: 'BS Accountancy', specialization: '—', status: 'active' },
  { id: 'p3', program: 'Information technology', course: 'BS Information Technology', specialization: 'Network administration', status: 'active' },
  { id: 'p4', program: 'Hospitality management', course: 'BS Hospitality Management', specialization: 'Hotel operations', status: 'active' },
  { id: 'p5', program: 'Marketing', course: 'BS Marketing Management', specialization: 'Digital marketing', status: 'active' },
]

export const learningOutcomes: LearningOutcome[] = [
  { id: 'o1', outcome: 'Able to configure and troubleshoot local area networks', industry: 'Information technology', status: 'active' },
  { id: 'o2', outcome: 'Able to prepare basic financial statements and reports', industry: 'Accounting', status: 'active' },
  { id: 'o3', outcome: 'Able to perform basic hardware diagnostics and repair', industry: 'Information technology', status: 'archived' },
  { id: 'o4', outcome: 'Able to handle front desk and guest relations operations', industry: 'Hospitality', status: 'active' },
  { id: 'o5', outcome: 'Able to execute basic digital marketing campaigns', industry: 'Marketing', status: 'active' },
]

export const appUsers: AppUser[] = [
  { id: 'u1', name: 'Thea Ramirez', email: 'thea.ramirez@frontlinebusiness.com.ph', mobileNumber: '+63 917 123 4567', role: 'Administrator', status: 'active' },
  { id: 'u2', name: 'Miguel Torres', email: 'miguel.torres@frontlinebusiness.com.ph', mobileNumber: '+63 917 234 5678', role: 'Program coordinator', status: 'active' },
  { id: 'u3', name: 'Bea Villanueva', email: 'bea.villanueva@frontlinebusiness.com.ph', mobileNumber: '+63 917 345 6789', role: 'Finance', status: 'pending' },
  { id: 'u4', name: 'Carlo Jimenez', email: 'carlo.jimenez@frontlinebusiness.com.ph', mobileNumber: '+63 917 456 7890', role: 'Trainer', status: 'active' },
  { id: 'u5', name: 'Nicole Aguilar', email: 'nicole.aguilar@frontlinebusiness.com.ph', mobileNumber: '+63 917 567 8901', role: 'Program coordinator', status: 'pending' },
  { id: 'u6', name: 'Juan Dela Cruz', email: 'juan.delacruz@sti.edu.ph', role: 'Trainee', status: 'active', isTraineeAccount: true },
]

/** The account currently signed in — drives the profile menu in the sidebar. */
export const currentUser: AppUser & { initials: string } = {
  id: appUsers[0].id,
  name: appUsers[0].name,
  email: appUsers[0].email,
  role: appUsers[0].role,
  status: appUsers[0].status,
  initials: 'TR',
}

export const leaveRecords: LeaveRecord[] = [
  {
    id: 'lv1', traineeId: 't8', traineeName: 'Sofia Mendoza', initials: 'SM', batchNo: 'B-2026-039', school: 'UST',
    leaveType: 'Sick Leave', leaveDate: '2026-06-28', returnDate: '2026-07-03',
    remarks: 'Diagnosed with flu, advised by clinic to rest for the week.',
    status: 'pending', dateSubmitted: '2026-06-27',
    supportingDocuments: [{ name: 'Medical certificate.pdf', link: 'https://drive.example.com/smendoza-medcert' }],
  },
  {
    id: 'lv2', traineeId: 't7', traineeName: 'Ryan Aquino', initials: 'RA', batchNo: 'B-2026-047', school: 'DLSU',
    leaveType: 'Bereavement Leave', leaveDate: '2026-06-30', returnDate: '2026-07-02',
    remarks: 'Family emergency \u2014 passing of a grandparent.',
    status: 'pending', dateSubmitted: '2026-06-29',
  },
  {
    id: 'lv3', traineeId: 't2', traineeName: 'Jared Cruz', initials: 'JC', batchNo: 'B-2026-042', school: 'AMA University',
    leaveType: 'School-Related Leave', leaveDate: '2026-07-01', returnDate: '2026-07-01',
    remarks: 'Required to attend a school thesis defense schedule.',
    status: 'pending', dateSubmitted: '2026-06-30',
    supportingDocuments: [{ name: 'School notice.pdf', link: 'https://drive.example.com/jcruz-schoolnotice' }],
  },
  {
    id: 'lv4', traineeId: 't1', traineeName: 'Maria Santos', initials: 'MS', batchNo: 'B-2026-042', school: 'STI College',
    leaveType: 'Vacation Leave', leaveDate: '2026-06-20', returnDate: '2026-06-22',
    remarks: 'Family trip planned before training ends.',
    status: 'approved', dateSubmitted: '2026-06-15',
    decisionRemarks: 'Approved \u2014 trainee is ahead on required hours.',
    decidedBy: 'Thea Ramirez', decisionDate: '2026-06-16',
  },
  {
    id: 'lv5', traineeId: 't6', traineeName: 'Bianca Torres', initials: 'BT', batchNo: 'B-2026-046', school: 'AMA University',
    leaveType: 'Vacation Leave', leaveDate: '2026-06-24', returnDate: '2026-06-25',
    remarks: 'Personal travel with family.',
    status: 'declined', dateSubmitted: '2026-06-18',
    decisionRemarks: 'Declined \u2014 requested dates overlap with the batch\u2019s mid-training evaluation.',
    decidedBy: 'Carlo Jimenez', decisionDate: '2026-06-19',
  },
  {
    id: 'lv6', traineeId: 't3', traineeName: 'Paolo Diaz', initials: 'PD', batchNo: 'B-2026-028', school: 'PUP',
    leaveType: 'Sick Leave', leaveDate: '2026-07-04', returnDate: '2026-07-06',
    remarks: 'Down with a fever, clinic advised 2 days rest.',
    status: 'pending', dateSubmitted: '2026-07-03',
  },
  {
    id: 'lv7', traineeId: 't5', traineeName: 'Kevin Lopez', initials: 'KL', batchNo: 'B-2026-046', school: 'STI College',
    leaveType: 'School-Related Leave', leaveDate: '2026-07-08', returnDate: '2026-07-08',
    remarks: 'Mandatory school seminar attendance.',
    status: 'approved', dateSubmitted: '2026-07-01',
    decidedBy: 'Miguel Torres', decisionDate: '2026-07-02',
  },
]

/** Days a leave spans, inclusive of both the leave date and return date. */
export function getLeaveDayCount(record: LeaveRecord): number {
  const start = new Date(record.leaveDate)
  const end = new Date(record.returnDate)
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, days)
}

export const tasks: TaskItem[] = [
  { id: 'tk1', title: 'Review endorsement letters for Batch B-2026-046', dueDate: '2026-07-02', assignee: 'Miguel Torres', status: 'in_progress' },
  { id: 'tk2', title: 'Prepare certificates for completed trainees', dueDate: '2026-07-03', assignee: 'Bea Villanueva', status: 'pending' },
  { id: 'tk3', title: 'Schedule mid-training evaluation for B-2026-042', dueDate: '2026-07-04', assignee: 'Thea Ramirez', status: 'pending' },
  { id: 'tk4', title: 'Follow up with STI College on new batch nomination', dueDate: '2026-07-01', assignee: 'Carlo Jimenez', status: 'done' },
  { id: 'tk5', title: 'Verify payment postings for Accounting seminar', dueDate: '2026-07-06', assignee: 'Bea Villanueva', status: 'in_progress' },
  { id: 'tk6', title: 'Send seminar reminder emails for B-2026-041 attendees', dueDate: '2026-07-07', assignee: 'Carlo Jimenez', status: 'pending' },
  { id: 'tk7', title: 'Archive completed biometric import logs for June', dueDate: '2026-07-05', assignee: 'Miguel Torres', status: 'done' },
]

export const announcements: Announcement[] = [
  {
    id: 'an1',
    title: 'System maintenance this weekend',
    body: 'LSS Admin will be briefly unavailable on Saturday, 10 PM\u201312 MN for scheduled maintenance.',
    postedBy: 'Thea Ramirez',
    postedAt: '2026-06-29',
    audience: 'All trainees',
    recipientCount: 8,
    status: 'active',
  },
  {
    id: 'an2',
    title: 'New partner school onboarded',
    body: 'University of Santo Tomas has been added as a partner school for the IT and Accounting tracks.',
    postedBy: 'Miguel Torres',
    postedAt: '2026-06-27',
    audience: 'All trainees',
    recipientCount: 8,
    status: 'active',
  },
  {
    id: 'an3',
    title: 'Reminder: Q2 rating survey closes soon',
    body: 'Please remind partner schools to complete the Q2 program satisfaction survey before July 5.',
    postedBy: 'Thea Ramirez',
    postedAt: '2026-06-25',
    audience: 'Trainees with incomplete documents',
    recipientCount: 3,
    status: 'active',
  },
  {
    id: 'an4',
    title: 'Batch B-2026-042 orientation reminder',
    body: 'Orientation materials for B-2026-042 have been shared via email. Please review before your first day.',
    postedBy: 'Carlo Jimenez',
    postedAt: '2026-06-10',
    audience: 'Specific batch',
    batchNo: 'B-2026-042',
    recipientCount: 2,
    status: 'archived',
  },
  {
    id: 'an5',
    title: 'Upcoming seminar: Intro to Data Privacy for HR Teams',
    body: 'Registration is now open for our July 18 seminar on Data Privacy Act compliance. Share the registration link with interested HR contacts.',
    postedBy: 'Thea Ramirez',
    postedAt: '2026-07-02',
    audience: 'All trainees',
    recipientCount: 8,
    status: 'active',
  },
  {
    id: 'an6',
    title: 'Holiday schedule reminder',
    body: 'The office will be closed on July 20 in observance of the Independence Day break. No trainee attendance will be recorded that day.',
    postedBy: 'Miguel Torres',
    postedAt: '2026-07-01',
    audience: 'All trainees',
    recipientCount: 8,
    status: 'active',
  },
]

export const calendarEvents: CalendarEvent[] = [
  { id: 'ev1', date: '2026-07-01', title: 'Trainee onboarding — Batch B-2026-046', type: 'batch' },
  { id: 'ev2', date: '2026-07-05', title: 'Batch B-2026-042 training ends', type: 'batch' },
  { id: 'ev3', date: '2026-07-04', title: 'Mid-training evaluation — B-2026-042', type: 'evaluation' },
  { id: 'ev4', date: '2026-07-06', title: 'Partner school coordination meeting', type: 'meeting' },
  { id: 'ev5', date: '2026-07-10', title: 'Batch B-2026-046 training ends', type: 'batch' },
  { id: 'ev6', date: '2026-07-13', title: 'Batch B-2026-047 training ends', type: 'batch' },
  { id: 'ev7', date: '2026-07-20', title: 'Program Independence Day break', type: 'holiday' },
]

/** Total earnings figure for the dashboard summary card (mock). */

/** Overall Learning Solutions program rating out of 5 (mock). */
export const overallProgramRating = 4.6

/** Trainees accommodated by the LS Department per year (dashboard bar chart, approved by Sir J 6/29/2026) */
export const traineesPerYear: { year: string; count: number }[] = [
  { year: '2022', count: 148 },
  { year: '2023', count: 210 },
  { year: '2024', count: 264 },
  { year: '2025', count: 301 },
  { year: '2026', count: 193 },
]

export const biometricRecords: BiometricRecord[] = [
  { id: 'bio1', traineeId: 't1', date: '2026-06-29', timeIn: '08:02', timeOut: '17:05', onLeave: false, importId: 'imp1' },
  { id: 'bio2', traineeId: 't1', date: '2026-06-30', timeIn: '07:58', timeOut: '17:00', onLeave: false, importId: 'imp1' },
  { id: 'bio3', traineeId: 't1', date: '2026-07-01', timeIn: '08:10', onLeave: false, importId: 'imp2' },
  { id: 'bio4', traineeId: 't2', date: '2026-06-29', onLeave: true, remarks: 'Sick Leave', importId: 'imp1' },
  { id: 'bio5', traineeId: 't2', date: '2026-06-30', timeIn: '08:00', timeOut: '17:00', onLeave: false, importId: 'imp1' },
  { id: 'bio6', traineeId: 't5', date: '2026-06-29', timeIn: '08:15', timeOut: '17:10', onLeave: false, importId: 'imp1' },
  { id: 'bio7', traineeId: 't5', date: '2026-06-30', timeIn: '08:05', timeOut: '17:00', onLeave: false, importId: 'imp1' },
  { id: 'bio8', traineeId: 't6', date: '2026-06-29', timeIn: '08:00', timeOut: '16:55', onLeave: false, importId: 'imp1' },
  { id: 'bio9', traineeId: 't6', date: '2026-06-30', onLeave: false, remarks: 'Missing time out — forgot to log out', importId: 'imp1' },
  { id: 'bio10', traineeId: 't8', date: '2026-07-01', timeIn: '08:07', timeOut: '17:02', onLeave: false, importId: 'imp2' },
]

/**
 * Training hours are always derived from the recorded time in/out rather than
 * stored, so an edited punch can never drift out of sync with its total.
 * On-leave days generate no hours per spec, regardless of any stray punches.
 */
export function computeHoursRendered(record: BiometricRecord): number {
  if (record.onLeave) return 0
  if (!record.timeIn || !record.timeOut) return 0
  const [inH, inM] = record.timeIn.split(':').map(Number)
  const [outH, outM] = record.timeOut.split(':').map(Number)
  if ([inH, inM, outH, outM].some((n) => Number.isNaN(n))) return 0
  const minutes = outH * 60 + outM - (inH * 60 + inM)
  if (minutes <= 0) return 0
  return Math.round((minutes / 60) * 100) / 100
}

/** A record needs review when it isn't an approved leave day but is missing a time in or time out. */
export function isRecordFlagged(record: BiometricRecord): boolean {
  return !record.onLeave && (!record.timeIn || !record.timeOut)
}

export const biometricImports: BiometricImportBatch[] = [
  { id: 'imp1', fileName: 'biometrics_2026-06-29_to_06-30.csv', importedBy: 'Thea Ramirez', importedAt: '2026-06-30', totalRows: 4, successCount: 4, errorCount: 0, status: 'success' },
  { id: 'imp2', fileName: 'biometrics_2026-07-01.csv', importedBy: 'Thea Ramirez', importedAt: '2026-07-01', totalRows: 2, successCount: 1, errorCount: 1, status: 'partial' },
]

export const taskRecords: TaskRecord[] = [
  { id: 'tk1', batchNo: 'B-2026-042', task: 'System requirements gathering', description: 'Interview stakeholders and draft SRS', timeGoal: 8, timeSpent: 8, trainee: 'Maria Santos', trainer: 'Sir Ralph', date: '2026-06-29', status: 'completed', onLeave: false },
  { id: 'tk2', batchNo: 'B-2026-042', task: 'UI mockup review', description: 'Review Batches and Trainees screens', timeGoal: 6, timeSpent: 0, trainee: 'Jomar Cruz', trainer: 'Sir Roy', date: '2026-06-30', status: 'open', onLeave: true, leaveReason: 'Sick Leave' },
  { id: 'tk3', batchNo: 'B-2026-041', task: 'Bookkeeping reconciliation', description: 'Reconcile June ledger entries', timeGoal: 8, timeSpent: 5, trainee: 'Angela Reyes', trainer: 'Ms. Thea', date: '2026-06-30', status: 'open', onLeave: false },
  { id: 'tk4', batchNo: 'B-2026-042', task: 'API integration testing', description: 'Test batch registration link endpoint', timeGoal: 8, timeSpent: 8, trainee: 'Maria Santos', trainer: 'Sir Ralph', date: '2026-06-30', status: 'completed', onLeave: false, remarks: 'Completed ahead of schedule' },
  { id: 'tk5', batchNo: 'B-2026-039', task: 'Client onboarding deck', description: 'Prepare onboarding presentation for new partner school', timeGoal: 4, timeSpent: 0, trainee: 'Jomar Cruz', trainer: 'Sir Mon', date: '2026-07-01', status: 'locked', onLeave: false, remarks: 'Locked pending trainer review' },
]

export const taskRatingRecords: TaskRating[] = [
  {
    id: 'rt1', batchNo: 'B-2026-042', taskName: 'System requirements gathering',
    traineeId: 't1', traineeName: 'Maria Santos', rating: 90, evaluator: 'Sir Ralph', ratedAt: '2026-06-30',
    comments: 'Thorough interviews and a well-structured SRS document.',
    history: [{ rating: 90, comments: 'Thorough interviews and a well-structured SRS document.', evaluator: 'Sir Ralph', ratedAt: '2026-06-30' }],
  },
  {
    id: 'rt2', batchNo: 'B-2026-042', taskName: 'API integration testing',
    traineeId: 't1', traineeName: 'Maria Santos', rating: 100, evaluator: 'Sir Ralph', ratedAt: '2026-07-01',
    comments: 'Finished ahead of schedule with clean test coverage.',
    history: [
      { rating: 80, comments: 'Good pace, a few edge cases missed.', evaluator: 'Sir Ralph', ratedAt: '2026-06-30' },
      { rating: 100, comments: 'Finished ahead of schedule with clean test coverage.', evaluator: 'Sir Ralph', ratedAt: '2026-07-01' },
    ],
  },
  {
    id: 'rt3', batchNo: 'B-2026-041', taskName: 'Bookkeeping reconciliation',
    traineeId: 't4', traineeName: 'Angela Reyes', rating: 94, evaluator: 'Ms. Thea', ratedAt: '2026-06-30',
    comments: 'Very accurate reconciliation, minimal supervision needed.',
    history: [{ rating: 94, comments: 'Very accurate reconciliation, minimal supervision needed.', evaluator: 'Ms. Thea', ratedAt: '2026-06-30' }],
  },
]

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

/* --------------------------------------------------------------------- *
 *  Certificate citations — reusable write-ups used when generating and
 *  issuing certificates from the Certificate page (Trainees & Seminar
 *  tabs) and from a trainee's own Certificate sub-tab. Supports
 *  placeholder tokens substituted per-recipient at print time.
 * --------------------------------------------------------------------- */
export const certificateCitations: CertificateCitation[] = [
  {
    id: 'cit1',
    title: 'Standard OJT Completion',
    appliesTo: 'Trainee',
    bodyText:
      'This is to certify that {{name}} of {{school}} has successfully completed {{hours}} hours of on-the-job training in {{industry}} under the {{program}} program, from {{dateStarted}} to {{dateCompleted}}. This certificate is awarded in recognition of the trainee\u2019s dedication, professionalism, and satisfactory performance throughout the training period.',
    status: 'active',
    critical: true,
    createdBy: 'Thea Ramirez',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'cit2',
    title: 'Work Immersion Completion',
    appliesTo: 'Trainee',
    bodyText:
      'This is to certify that {{name}} has satisfactorily completed the required {{hours}} hours of Senior High School Work Immersion in {{industry}}, from {{dateStarted}} to {{dateCompleted}}, in partial fulfillment of the requirements set by the Department of Education.',
    status: 'active',
    createdBy: 'Miguel Torres',
    createdAt: '2026-02-02T09:00:00.000Z',
    updatedAt: '2026-02-02T09:00:00.000Z',
  },
  {
    id: 'cit3',
    title: 'Seminar / Webinar Attendance',
    appliesTo: 'Seminar',
    bodyText:
      'This is to certify that {{name}} has successfully attended and participated in "{{seminarTopic}}" held on {{date}}, organized by Frontline Business Solutions \u2014 Learning Solutions System.',
    status: 'active',
    critical: true,
    createdBy: 'Thea Ramirez',
    createdAt: '2026-01-20T09:00:00.000Z',
    updatedAt: '2026-06-27T09:00:00.000Z',
  },
  {
    id: 'cit4',
    title: 'Seminar Resource Speaker Recognition',
    appliesTo: 'Seminar',
    bodyText:
      'This certificate of recognition is presented to {{name}} for sharing valuable expertise as a resource speaker for "{{seminarTopic}}" on {{date}}, contributing meaningfully to the professional growth of all participants.',
    status: 'active',
    createdBy: 'Nicole Aguilar',
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
  {
    id: 'cit5',
    title: 'Upskill Training Completion (Legacy)',
    appliesTo: 'Both',
    bodyText:
      'This is to certify that {{name}} has completed the {{program}} upskilling track covering {{hours}} training hours, demonstrating readiness for the competencies assessed under this program.',
    status: 'archived',
    createdBy: 'Bea Villanueva',
    createdAt: '2025-11-10T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
  },
]

/* --------------------------------------------------------------------- *
 *  Evaluation questions — organized per category, then per question set
 *  (Trainer sets: Information Technology / Accounting -- admin-scalable to
 *  more industries; Seminar sets: per seminar track). Question sets and
 *  sections keep long questionnaires organized instead of one flat list.
 * --------------------------------------------------------------------- */

let _eqSeq = 0
function eq(
  question: string,
  category: 'Trainer' | 'Seminar',
  questionSet: string,
  section: string,
  type: 'rating' | 'text' = 'rating',
  critical = false,
): EvaluationQuestion {
  _eqSeq += 1
  return {
    id: `eq${_eqSeq}`,
    question,
    category,
    questionSet,
    section,
    type,
    status: 'active',
    critical,
    createdBy: 'Ms. Thea',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-12',
  }
}

const GENERAL_WRITTEN_QUESTIONS: [string, boolean?][] = [
  ['What did you like most about the Frontline Business Solutions Training Program? (You may include aspects related to trainers, projects, or learning experience.)'],
  ['What did you like least about the Frontline Business Solutions Training Program? (You may include any challenges you faced with tasks, learning materials, or trainers.)'],
  ['How would you describe the performance and support of the trainers? (Consider clarity of instructions, professionalism, guidance, and approachability.)', true],
  ['What suggestions would you like to make to improve the future Frontline Business Solutions Training Program? (You can suggest improvements related to projects, learning materials, or trainer support.)'],
  ['Other comments you would like to make: (Any additional feedback about your overall experience.)'],
]

function generalWrittenQuestions(questionSet: string): EvaluationQuestion[] {
  return GENERAL_WRITTEN_QUESTIONS.map(([q, critical]) => eq(q as string, 'Trainer', questionSet, 'General Feedback', 'text', !!critical))
}

/* ----- Information Technology (Trainer question set) ----- */
const IT_QUESTIONS: EvaluationQuestion[] = [
  ...generalWrittenQuestions('Information Technology'),

  // I. Trainee Self-Assessment (Knowledge and Skills)
  eq('I understand the basic principles of UI/UX design (layout, typography, color, spacing).', 'Trainer', 'Information Technology', 'UI/UX Design (Figma)'),
  eq('I can design website mockups and interfaces using Figma.', 'Trainer', 'Information Technology', 'UI/UX Design (Figma)'),
  eq('I can create user-friendly and visually appealing design layouts.', 'Trainer', 'Information Technology', 'UI/UX Design (Figma)'),

  eq('I can develop responsive web designs that adapt to different screen sizes.', 'Trainer', 'Information Technology', 'Responsive Web Design (HTML, CSS, Tailwind, SASS)'),
  eq('I can convert UI/UX designs into functional web pages using HTML and CSS.', 'Trainer', 'Information Technology', 'Responsive Web Design (HTML, CSS, Tailwind, SASS)'),
  eq('I can use Tailwind CSS and/or SASS to build layouts efficiently and consistently.', 'Trainer', 'Information Technology', 'Responsive Web Design (HTML, CSS, Tailwind, SASS)'),

  eq('I understand the basic structure and functionality of WordPress.', 'Trainer', 'Information Technology', 'Content Management System (WordPress)'),
  eq('I can convert a static website into a WordPress website.', 'Trainer', 'Information Technology', 'Content Management System (WordPress)'),
  eq('I can manage content, themes, and basic customization in WordPress.', 'Trainer', 'Information Technology', 'Content Management System (WordPress)'),

  eq('I can apply JavaScript to create interactive website features.', 'Trainer', 'Information Technology', 'Frontend Development (JavaScript & ReactJS)'),
  eq('I understand ReactJS fundamentals (components, props, and state).', 'Trainer', 'Information Technology', 'Frontend Development (JavaScript & ReactJS)'),
  eq('I can manage data and application flow using ReactJS (e.g., state and context).', 'Trainer', 'Information Technology', 'Frontend Development (JavaScript & ReactJS)'),

  eq('I understand how APIs work and how to integrate them into web applications.', 'Trainer', 'Information Technology', 'Backend Integration (API, MySQL, CRUD, CORS)'),
  eq('I can perform basic CRUD operations using a database (e.g., MySQL).', 'Trainer', 'Information Technology', 'Backend Integration (API, MySQL, CRUD, CORS)'),
  eq('I understand basic backend concepts such as CORS and data handling.', 'Trainer', 'Information Technology', 'Backend Integration (API, MySQL, CRUD, CORS)'),

  // II. Trainers' Performance & Professionalism
  eq('Trainers demonstrated expertise in teaching technical IT concepts and tools.', 'Trainer', 'Information Technology', "Trainers' Performance & Professionalism", 'rating', true),
  eq('Trainers provided clear instructions and constructive feedback on coding and project outputs.', 'Trainer', 'Information Technology', "Trainers' Performance & Professionalism"),
  eq('Trainers were professional, approachable, and supportive throughout the program.', 'Trainer', 'Information Technology', "Trainers' Performance & Professionalism"),

  // III. Industry Readiness & Employability Assessment
  eq('I can develop responsive and functional web pages in a real work environment.', 'Trainer', 'Information Technology', 'Technical Readiness (Hard Skills Application)'),
  eq('I can convert UI/UX designs into actual working websites using HTML, CSS, and frameworks.', 'Trainer', 'Information Technology', 'Technical Readiness (Hard Skills Application)'),
  eq('I can apply JavaScript and/or ReactJS in building interactive web applications.', 'Trainer', 'Information Technology', 'Technical Readiness (Hard Skills Application)'),
  eq('I can use development tools and frameworks (e.g., Tailwind CSS, SASS) efficiently in real projects.', 'Trainer', 'Information Technology', 'Technical Readiness (Hard Skills Application)'),
  eq('I can handle basic backend integration such as APIs, CRUD operations, and databases (e.g., MySQL).', 'Trainer', 'Information Technology', 'Technical Readiness (Hard Skills Application)'),

  eq('I can work independently with minimal supervision on technical tasks.', 'Trainer', 'Information Technology', 'Work Readiness'),
  eq('I can meet deadlines and manage my time effectively during project development.', 'Trainer', 'Information Technology', 'Work Readiness'),
  eq('I can follow coding standards, best practices, and project requirements.', 'Trainer', 'Information Technology', 'Work Readiness'),
  eq('I can communicate effectively with team members and supervisors regarding technical tasks.', 'Trainer', 'Information Technology', 'Work Readiness'),
  eq('I can adapt to new technologies, tools, and project changes.', 'Trainer', 'Information Technology', 'Work Readiness'),

  eq('I demonstrate attention to detail in coding and project outputs.', 'Trainer', 'Information Technology', 'Professional Attitude'),
  eq('I show responsibility and accountability in completing assigned tasks.', 'Trainer', 'Information Technology', 'Professional Attitude'),
  eq('I maintain professionalism in all tasks and interactions.', 'Trainer', 'Information Technology', 'Professional Attitude'),
  eq('I can handle project files, codes, and data responsibly.', 'Trainer', 'Information Technology', 'Professional Attitude'),
  eq('I am willing to continuously learn and improve my technical skills.', 'Trainer', 'Information Technology', 'Professional Attitude'),
]

/* ----- Accounting (Trainer question set) ----- */
const ACCOUNTING_QUESTIONS: EvaluationQuestion[] = [
  ...generalWrittenQuestions('Accounting'),

  // I. Trainee Self-Assessment (Knowledge and Skills)
  eq('I understand the fundamental accounting concepts and principles.', 'Trainer', 'Accounting', 'Basic Bookkeeping / Accounting'),
  eq('I can accurately record journal entries.', 'Trainer', 'Accounting', 'Basic Bookkeeping / Accounting'),
  eq('I can prepare basic financial statements (Income Statement, Balance Sheet).', 'Trainer', 'Accounting', 'Basic Bookkeeping / Accounting'),

  eq('I can use advanced Excel formulas (e.g., IF, VLOOKUP/XLOOKUP, SUMIF), create and analyze Pivot Tables, and apply data validation and conditional formatting effectively.', 'Trainer', 'Accounting', 'Excel Advanced Functions'),
  eq('I can organize and clean data for reporting purposes.', 'Trainer', 'Accounting', 'Excel Advanced Functions'),
  eq('I can use Excel to automate basic accounting tasks.', 'Trainer', 'Accounting', 'Excel Advanced Functions'),

  eq('I can prepare a basic business budget, monitor, and analyze financial performance.', 'Trainer', 'Accounting', 'Business Decision-Making Processes (Budgeting, Monitoring, Costing, and Projections)'),
  eq('I understand different costing methods and create financial projections.', 'Trainer', 'Accounting', 'Business Decision-Making Processes (Budgeting, Monitoring, Costing, and Projections)'),
  eq('I can use financial data to support business decisions.', 'Trainer', 'Accounting', 'Business Decision-Making Processes (Budgeting, Monitoring, Costing, and Projections)'),

  eq('I understand the requirements for registering a sole proprietorship, partnership, and corporation.', 'Trainer', 'Accounting', 'Business Registration Processes'),
  eq('I am familiar with government agencies involved in registration.', 'Trainer', 'Accounting', 'Business Registration Processes'),
  eq('I can explain the steps in business registration in the Philippines.', 'Trainer', 'Accounting', 'Business Registration Processes'),

  eq('I understand payroll computation (gross to net pay) and statutory deductions (SSS, PhilHealth, Pag-IBIG).', 'Trainer', 'Accounting', 'Philippine Payroll'),
  eq('I understand employee benefits and contributions.', 'Trainer', 'Accounting', 'Philippine Payroll'),
  eq('I can prepare a basic payroll report.', 'Trainer', 'Accounting', 'Philippine Payroll'),

  eq('I understand basic tax concepts in the Philippines.', 'Trainer', 'Accounting', 'Philippine Taxation (Common Individual and Business Taxes)'),
  eq('I can identify common taxes (Income Tax, VAT, Percentage Tax).', 'Trainer', 'Accounting', 'Philippine Taxation (Common Individual and Business Taxes)'),
  eq('I understand how to compute basic taxes.', 'Trainer', 'Accounting', 'Philippine Taxation (Common Individual and Business Taxes)'),

  eq('I have a basic understanding of the US tax system.', 'Trainer', 'Accounting', 'US Payroll and Taxation'),
  eq('I am familiar with common US payroll processes.', 'Trainer', 'Accounting', 'US Payroll and Taxation'),
  eq('I understand the differences between Philippine and US taxation.', 'Trainer', 'Accounting', 'US Payroll and Taxation'),

  eq('I understand basic system functions (invoicing, expenses, reconciliation).', 'Trainer', 'Accounting', 'Accounting Systems (QuickBooks Online & Xero)'),
  eq('I can record transactions and generate financial reports using accounting systems.', 'Trainer', 'Accounting', 'Accounting Systems (QuickBooks Online & Xero)'),
  eq('I feel confident using accounting software for basic tasks.', 'Trainer', 'Accounting', 'Accounting Systems (QuickBooks Online & Xero)'),

  // II. Trainers' Performance & Professionalism
  eq('Trainers demonstrated expertise in teaching technical concepts.', 'Trainer', 'Accounting', "Trainers' Performance & Professionalism", 'rating', true),
  eq('Trainers provided clear instructions and constructive feedback.', 'Trainer', 'Accounting', "Trainers' Performance & Professionalism"),
  eq('Trainers were professional, approachable, and supportive.', 'Trainer', 'Accounting', "Trainers' Performance & Professionalism"),

  // III. Industry Readiness & Employability Assessment
  eq('I can perform accounting tasks accurately in a real work environment.', 'Trainer', 'Accounting', 'Technical Readiness (Hard Skills Application)'),
  eq('I can apply bookkeeping and accounting processes in actual business scenarios.', 'Trainer', 'Accounting', 'Technical Readiness (Hard Skills Application)'),
  eq('I can use Excel efficiently for workplace tasks.', 'Trainer', 'Accounting', 'Technical Readiness (Hard Skills Application)'),
  eq('I can use accounting systems (QuickBooks/Xero) in real job situations.', 'Trainer', 'Accounting', 'Technical Readiness (Hard Skills Application)'),
  eq('I can handle payroll and basic tax computations in practice.', 'Trainer', 'Accounting', 'Technical Readiness (Hard Skills Application)'),

  eq('I can work independently with minimal supervision.', 'Trainer', 'Accounting', 'Work Readiness'),
  eq('I can meet deadlines and manage my time effectively.', 'Trainer', 'Accounting', 'Work Readiness'),
  eq('I can follow workplace procedures and standards.', 'Trainer', 'Accounting', 'Work Readiness'),
  eq('I can communicate effectively with team members and supervisors.', 'Trainer', 'Accounting', 'Work Readiness'),
  eq('I can adapt to workplace challenges and changes.', 'Trainer', 'Accounting', 'Work Readiness'),

  eq('I demonstrate accuracy and attention to detail in tasks.', 'Trainer', 'Accounting', 'Professional Attitude'),
  eq('I show responsibility and accountability in my work.', 'Trainer', 'Accounting', 'Professional Attitude'),
  eq('I maintain professionalism in all tasks.', 'Trainer', 'Accounting', 'Professional Attitude'),
  eq('I can handle confidential financial information responsibly.', 'Trainer', 'Accounting', 'Professional Attitude'),
  eq('I am willing to continuously learn and improve.', 'Trainer', 'Accounting', 'Professional Attitude'),
]

/* ----- Seminar question sets (per seminar track -- scalable to more tracks) ----- */
const SEMINAR_TECH_QUESTIONS: EvaluationQuestion[] = [
  eq('The resource speaker demonstrated strong command of the topic.', 'Seminar', 'Technical & Automation Workshops', 'Resource Speaker Assessment', 'rating', true),
  eq('The hands-on demos and workflows were easy to follow.', 'Seminar', 'Technical & Automation Workshops', 'Resource Speaker Assessment'),
  eq('The seminar materials (slides, guides, sample files) were useful and well-organized.', 'Seminar', 'Technical & Automation Workshops', 'Resource Speaker Assessment'),
  eq('The resource speaker managed time and the Q&A well.', 'Seminar', 'Technical & Automation Workshops', 'Resource Speaker Assessment'),
  eq('I feel confident applying what I learned to my own projects or workflows.', 'Seminar', 'Technical & Automation Workshops', 'Learning Outcomes'),
  eq('I would recommend this seminar to other participants.', 'Seminar', 'Technical & Automation Workshops', 'Learning Outcomes'),
  eq('What did you find most useful about this seminar?', 'Seminar', 'Technical & Automation Workshops', 'General Feedback', 'text'),
  eq('What could be improved for future technical workshops like this one?', 'Seminar', 'Technical & Automation Workshops', 'General Feedback', 'text'),
]

const SEMINAR_COMPLIANCE_QUESTIONS: EvaluationQuestion[] = [
  eq('The resource speaker demonstrated strong command of the topic.', 'Seminar', 'Compliance & Softskills Seminars', 'Resource Speaker Assessment', 'rating', true),
  eq('The seminar content was relevant to my role and responsibilities.', 'Seminar', 'Compliance & Softskills Seminars', 'Resource Speaker Assessment'),
  eq('The seminar materials were useful and well-organized.', 'Seminar', 'Compliance & Softskills Seminars', 'Resource Speaker Assessment'),
  eq('The resource speaker managed time and the Q&A well.', 'Seminar', 'Compliance & Softskills Seminars', 'Resource Speaker Assessment'),
  eq('I have a clearer understanding of the compliance requirements covered.', 'Seminar', 'Compliance & Softskills Seminars', 'Learning Outcomes'),
  eq('I would recommend this seminar to other participants.', 'Seminar', 'Compliance & Softskills Seminars', 'Learning Outcomes'),
  eq('What did you find most useful about this seminar?', 'Seminar', 'Compliance & Softskills Seminars', 'General Feedback', 'text'),
  eq('What could be improved for future seminars of this kind?', 'Seminar', 'Compliance & Softskills Seminars', 'General Feedback', 'text'),
]

export const evaluationQuestions: EvaluationQuestion[] = [
  ...IT_QUESTIONS,
  ...ACCOUNTING_QUESTIONS,
  ...SEMINAR_TECH_QUESTIONS,
  ...SEMINAR_COMPLIANCE_QUESTIONS,
]

/** Distinct question sets available per category -- surfaced as tabs in the questionnaire builder. */
export const questionSetsByCategory: Record<'Trainer' | 'Seminar', string[]> = {
  Trainer: Array.from(new Set(evaluationQuestions.filter((q) => q.category === 'Trainer').map((q) => q.questionSet))),
  Seminar: Array.from(new Set(evaluationQuestions.filter((q) => q.category === 'Seminar').map((q) => q.questionSet))),
}

/** Auto-generates a plausible per-question answer breakdown from a set's active questions, for demo/mock purposes. */
function buildAnswers(category: 'Trainer' | 'Seminar', questionSet: string, baseScore: number, seed: number): EvaluationAnswer[] {
  const pool = evaluationQuestions.filter((q) => q.category === category && q.questionSet === questionSet && q.status === 'active')
  const textFillers = [
    'Overall a solid experience -- the pacing and support were appreciated.',
    'Instructions were clear and I felt guided throughout the tasks.',
    'A bit more sample material would help future batches.',
    'I feel more prepared for real project work after this.',
  ]
  return pool.map((q, i) => {
    if (q.type === 'text') {
      return { questionId: q.id, question: q.question, section: q.section, type: q.type, value: textFillers[(seed + i) % textFillers.length] }
    }
    const jitter = ((seed + i) % 3) - 1 // -1, 0, or 1
    const value = Math.min(5, Math.max(3, Math.round(baseScore) + jitter))
    return { questionId: q.id, question: q.question, section: q.section, type: q.type, value }
  })
}

/* --------------------------------------------------------------------- *
 *  Evaluation responses — trainee → trainer, and participant → speaker
 * --------------------------------------------------------------------- */

function makeResponse(
  base: Omit<EvaluationResponse, 'answers' | 'answeredCount'>,
  category: 'Trainer' | 'Seminar',
  questionSet: string,
  seed: number,
): EvaluationResponse {
  const answers = buildAnswers(category, questionSet, base.averageScore, seed)
  return { ...base, questionSet, answers, answeredCount: answers.length }
}

export const evaluationResponses: EvaluationResponse[] = [
  makeResponse({ id: 'er1', category: 'Trainer', batchNo: 'B-2026-042', respondentId: 't1', respondentName: 'Maria Santos', targetName: 'Carlo Jimenez', averageScore: 4.8, submittedAt: '2026-06-29', status: 'active', critical: true }, 'Trainer', 'Information Technology', 1),
  makeResponse({ id: 'er2', category: 'Trainer', batchNo: 'B-2026-042', respondentId: 't2', respondentName: 'Jared Cruz', targetName: 'Carlo Jimenez', averageScore: 4.5, submittedAt: '2026-06-30', status: 'active' }, 'Trainer', 'Information Technology', 2),
  makeResponse({ id: 'er3', category: 'Trainer', batchNo: 'B-2026-046', respondentId: 't6', respondentName: 'Bianca Torres', targetName: 'Bea Villanueva', averageScore: 4.6, submittedAt: '2026-06-25', status: 'active' }, 'Trainer', 'Accounting', 3),
  makeResponse({ id: 'er4', category: 'Trainer', batchNo: 'B-2026-039', respondentId: 't8', respondentName: 'Sofia Mendoza', targetName: 'Carlo Jimenez', averageScore: 4.9, submittedAt: '2026-05-30', status: 'active', critical: true }, 'Trainer', 'Information Technology', 4),
  makeResponse({ id: 'er5', category: 'Trainer', batchNo: 'B-2026-047', respondentId: 't7', respondentName: 'Ryan Aquino', targetName: 'Carlo Jimenez', averageScore: 4.0, submittedAt: '2026-06-10', status: 'archived' }, 'Trainer', 'Information Technology', 5),
  makeResponse({ id: 'er6', category: 'Trainer', batchNo: 'B-2026-033', respondentId: 't4', respondentName: 'Angela Reyes', targetName: 'Ms. Thea', averageScore: 4.7, submittedAt: '2026-03-18', status: 'active' }, 'Trainer', 'Accounting', 6),
  makeResponse({ id: 'er9', category: 'Trainer', batchNo: 'B-2026-046', respondentId: 't9', respondentName: 'Kevin Dela Peña', targetName: 'Bea Villanueva', averageScore: 4.3, submittedAt: '2026-06-27', status: 'active' }, 'Trainer', 'Accounting', 7),
  makeResponse({ id: 'er10', category: 'Trainer', batchNo: 'B-2026-042', respondentId: 't10', respondentName: 'Nicole Ramos', targetName: 'Carlo Jimenez', averageScore: 4.7, submittedAt: '2026-07-01', status: 'active' }, 'Trainer', 'Information Technology', 8),
  makeResponse({ id: 'er7', category: 'Seminar', seminarTopic: 'Automating with n8n: Smarter Workflows with AI', respondentId: 'sp1', respondentName: 'Carla Dizon', targetName: 'Engr. Paolo Ramos', averageScore: 4.9, submittedAt: '2026-06-27', status: 'active', critical: true }, 'Seminar', 'Technical & Automation Workshops', 9),
  makeResponse({ id: 'er8', category: 'Seminar', seminarTopic: 'Automating with n8n: Smarter Workflows with AI', respondentId: 'sp2', respondentName: 'Miguel Torres', targetName: 'Engr. Paolo Ramos', averageScore: 4.6, submittedAt: '2026-06-27', status: 'active' }, 'Seminar', 'Technical & Automation Workshops', 10),
]

/** Trainees whose rendered hours have met/exceeded required hours and have not yet submitted a trainer evaluation. */
export function getEvaluationReminderCandidates(traineeList: Trainee[], responses: EvaluationResponse[]) {
  const submittedIds = new Set(responses.filter((r) => r.category === 'Trainer' && r.status === 'active').map((r) => r.respondentId))
  return traineeList.filter((t) => !t.archived && t.completedHrs >= t.requiredHrs && !submittedIds.has(t.id))
}

/* --------------------------------------------------------------------- *
 *  Behavioral Rating — question bank + submitted evaluations
 * --------------------------------------------------------------------- */

export const behavioralQuestions: BehavioralQuestion[] = [
  // I. Work Performance & Discipline
  { id: 'bq1', section: 'I. Work Performance & Discipline', type: 'rating', order: 1, status: 'active', question: 'The trainee reports to training sessions on time and maintains regular attendance.' },
  { id: 'bq2', section: 'I. Work Performance & Discipline', type: 'rating', order: 2, status: 'active', question: 'The trainee follows instructions accurately and consistently.' },
  { id: 'bq3', section: 'I. Work Performance & Discipline', type: 'rating', order: 3, status: 'active', question: 'The trainee completes assigned tasks and activities on time.' },
  { id: 'bq4', section: 'I. Work Performance & Discipline', type: 'rating', order: 4, status: 'active', question: 'The trainee demonstrates responsibility in handling assigned work.' },
  { id: 'bq5', section: 'I. Work Performance & Discipline', type: 'rating', order: 5, status: 'active', question: 'The trainee observes rules, policies, and training guidelines.' },
  { id: 'bq6', section: 'I. Work Performance & Discipline', type: 'rating', order: 6, status: 'active', question: 'The trainee maintains orderliness and follows safety practices during activities.' },

  // II. Learning Ability & Technical Growth
  { id: 'bq7', section: 'II. Learning Ability & Technical Growth', type: 'rating', order: 7, status: 'active', question: 'The trainee shows eagerness and initiative to learn new skills and concepts.' },
  { id: 'bq8', section: 'II. Learning Ability & Technical Growth', type: 'rating', order: 8, status: 'active', question: 'The trainee quickly understands lessons, instructions, and demonstrations.' },
  { id: 'bq9', section: 'II. Learning Ability & Technical Growth', type: 'rating', order: 9, status: 'active', question: 'The trainee is able to apply learned knowledge in practical activities.' },
  { id: 'bq10', section: 'II. Learning Ability & Technical Growth', type: 'rating', order: 10, status: 'active', question: 'The trainee demonstrates improvement over time in task execution.' },
  { id: 'bq11', section: 'II. Learning Ability & Technical Growth', type: 'rating', order: 11, status: 'active', question: 'The trainee seeks ways to improve work output or processes.' },

  // III. Teamwork & Professional Behavior
  { id: 'bq12', section: 'III. Teamwork & Professional Behavior', type: 'rating', order: 12, status: 'active', question: 'The trainee cooperates well with co-trainees in group activities and tasks.' },
  { id: 'bq13', section: 'III. Teamwork & Professional Behavior', type: 'rating', order: 13, status: 'active', question: 'The trainee communicates respectfully with peers, trainers, and staff.' },
  { id: 'bq14', section: 'III. Teamwork & Professional Behavior', type: 'rating', order: 14, status: 'active', question: 'The trainee builds positive working relationships within the training environment.' },
  { id: 'bq15', section: 'III. Teamwork & Professional Behavior', type: 'rating', order: 15, status: 'active', question: 'The trainee shows professionalism in behavior and attitude during training.' },
  { id: 'bq16', section: 'III. Teamwork & Professional Behavior', type: 'rating', order: 16, status: 'active', question: 'The trainee accepts feedback and applies corrections constructively.' },

  // IV. Technical Competency & Job Readiness
  { id: 'bq17', section: 'IV. Technical Competency & Job Readiness', type: 'rating', order: 17, status: 'active', question: 'The trainee can perform tasks with minimal supervision.' },
  { id: 'bq18', section: 'IV. Technical Competency & Job Readiness', type: 'rating', order: 18, status: 'active', question: 'The trainee demonstrates confidence in completing assigned work.' },
  { id: 'bq19', section: 'IV. Technical Competency & Job Readiness', type: 'rating', order: 19, status: 'active', question: 'The trainee produces accurate and quality outputs.' },
  { id: 'bq20', section: 'IV. Technical Competency & Job Readiness', type: 'rating', order: 20, status: 'active', question: 'The trainee shows readiness to perform tasks in a real work environment.' },
  { id: 'bq21', section: 'IV. Technical Competency & Job Readiness', type: 'rating', order: 21, status: 'active', question: 'The trainee demonstrates problem-solving skills when encountering difficulties.' },

  // V. Trainer's General Evaluation of the Trainee
  { id: 'bq22', section: "V. Trainer's General Evaluation of the Trainee", type: 'text', order: 22, status: 'active', question: 'Overall performance of the trainee during the training program.' },
  { id: 'bq23', section: "V. Trainer's General Evaluation of the Trainee", type: 'text', order: 23, status: 'active', question: 'Strengths observed during the training period.' },
  { id: 'bq24', section: "V. Trainer's General Evaluation of the Trainee", type: 'text', order: 24, status: 'active', question: 'Areas that need improvement for future development.' },

  // VI. Written Feedback (paragraph-based answers required)
  { id: 'bq25', section: 'VI. Written Feedback', type: 'text', order: 25, status: 'active', question: "How would you describe the trainee's overall performance in the training program? (Include behavior, learning ability, technical skills, and attitude.)" },
  { id: 'bq26', section: 'VI. Written Feedback', type: 'text', order: 26, status: 'active', question: "What were the trainee's strongest skills or qualities during the training?" },
  { id: 'bq27', section: 'VI. Written Feedback', type: 'text', order: 27, status: 'active', question: 'What areas does the trainee need to improve?' },
  { id: 'bq28', section: 'VI. Written Feedback', type: 'text', order: 28, status: 'active', question: 'How prepared is the trainee for actual workplace or industry tasks?' },
  { id: 'bq29', section: 'VI. Written Feedback', type: 'text', order: 29, status: 'active', question: "Other comments or recommendations for the trainee's development." },
]

export const behavioralRatingRecords: BehavioralRating[] = [
  {
    id: 'br1',
    batchNo: 'B-2026-042',
    traineeId: 't1',
    traineeName: 'Maria Santos',
    answers: [
      { questionId: 'bq1', score: 5 },
      { questionId: 'bq2', score: 5 },
      { questionId: 'bq3', score: 4 },
      { questionId: 'bq4', score: 5 },
      { questionId: 'bq5', score: 5 },
      { questionId: 'bq6', score: 4 },
      { questionId: 'bq7', score: 5 },
      { questionId: 'bq8', score: 4 },
      { questionId: 'bq9', score: 5 },
      { questionId: 'bq10', score: 5 },
      { questionId: 'bq11', score: 4 },
      { questionId: 'bq12', score: 5 },
      { questionId: 'bq13', score: 5 },
      { questionId: 'bq14', score: 4 },
      { questionId: 'bq15', score: 5 },
      { questionId: 'bq16', score: 5 },
      { questionId: 'bq17', score: 4 },
      { questionId: 'bq18', score: 4 },
      { questionId: 'bq19', score: 5 },
      { questionId: 'bq20', score: 4 },
      { questionId: 'bq21', score: 4 },
      { questionId: 'bq22', text: 'Consistently strong performance throughout the training program.' },
      { questionId: 'bq23', text: 'Punctuality, technical troubleshooting, and clear communication.' },
      { questionId: 'bq24', text: 'Could take on more complex, client-facing tasks with practice.' },
      { questionId: 'bq25', text: 'Maria was punctual and proactive throughout the program, quickly picked up new networking and helpdesk concepts, and consistently produced accurate, well-documented work. Her attitude toward feedback and teamwork was excellent.' },
      { questionId: 'bq26', text: 'Her strongest qualities were attention to detail, fast learning of new tools, and clear written and verbal communication with both peers and trainers.' },
      { questionId: 'bq27', text: 'She can continue building confidence handling higher-pressure, client-facing troubleshooting scenarios.' },
      { questionId: 'bq28', text: 'She is well prepared for entry-level IT support or network administration roles and would need minimal onboarding.' },
      { questionId: 'bq29', text: 'Recommended for endorsement to partner companies after completion of the program.' },
    ],
    overallComments: 'Maria was punctual and proactive throughout the program, quickly picked up new networking and helpdesk concepts, and consistently produced accurate, well-documented work. Her attitude toward feedback and teamwork was excellent.',
    recommendation: 'Recommended for endorsement to partner companies after completion of the program.',
    evaluator: 'Sir Ralph',
    ratedAt: '2026-06-30',
    history: [
      {
        answers: [
          { questionId: 'bq1', score: 5 },
          { questionId: 'bq2', score: 5 },
          { questionId: 'bq3', score: 4 },
          { questionId: 'bq4', score: 5 },
          { questionId: 'bq5', score: 5 },
          { questionId: 'bq6', score: 4 },
          { questionId: 'bq7', score: 5 },
          { questionId: 'bq8', score: 4 },
          { questionId: 'bq9', score: 5 },
          { questionId: 'bq10', score: 5 },
          { questionId: 'bq11', score: 4 },
          { questionId: 'bq12', score: 5 },
          { questionId: 'bq13', score: 5 },
          { questionId: 'bq14', score: 4 },
          { questionId: 'bq15', score: 5 },
          { questionId: 'bq16', score: 5 },
          { questionId: 'bq17', score: 4 },
          { questionId: 'bq18', score: 4 },
          { questionId: 'bq19', score: 5 },
          { questionId: 'bq20', score: 4 },
          { questionId: 'bq21', score: 4 },
          { questionId: 'bq22', text: 'Consistently strong performance throughout the training program.' },
          { questionId: 'bq23', text: 'Punctuality, technical troubleshooting, and clear communication.' },
          { questionId: 'bq24', text: 'Could take on more complex, client-facing tasks with practice.' },
          { questionId: 'bq25', text: 'Maria was punctual and proactive throughout the program, quickly picked up new networking and helpdesk concepts, and consistently produced accurate, well-documented work. Her attitude toward feedback and teamwork was excellent.' },
          { questionId: 'bq26', text: 'Her strongest qualities were attention to detail, fast learning of new tools, and clear written and verbal communication with both peers and trainers.' },
          { questionId: 'bq27', text: 'She can continue building confidence handling higher-pressure, client-facing troubleshooting scenarios.' },
          { questionId: 'bq28', text: 'She is well prepared for entry-level IT support or network administration roles and would need minimal onboarding.' },
          { questionId: 'bq29', text: 'Recommended for endorsement to partner companies after completion of the program.' },
        ],
        overallComments: 'Maria was punctual and proactive throughout the program, quickly picked up new networking and helpdesk concepts, and consistently produced accurate, well-documented work. Her attitude toward feedback and teamwork was excellent.',
        recommendation: 'Recommended for endorsement to partner companies after completion of the program.',
        evaluator: 'Sir Ralph',
        ratedAt: '2026-06-30',
      },
    ],
  },
]

/* --------------------------------------------------------------------- *
 *  Payments module — pricing agreements & automatic computations
 * --------------------------------------------------------------------- */

/**
 * School-based volume pricing: the per-hour training fee applied to a school
 * depends on how many trainees it currently has enrolled with us. More
 * trainees from the same school → lower per-hour rate.
 */
export const pricingTiers: PricingTier[] = [
  { id: 'pt1', minTrainees: 1, maxTrainees: 5, ratePerHour: 12, label: '1–5 trainees' },
  { id: 'pt2', minTrainees: 6, maxTrainees: 15, ratePerHour: 10, label: '6–15 trainees' },
  { id: 'pt3', minTrainees: 16, maxTrainees: 30, ratePerHour: 8, label: '16–30 trainees' },
  { id: 'pt4', minTrainees: 31, ratePerHour: 6, label: '31+ trainees' },
]

/** Predefined discount agreements / promotional rates per partner school. Schools with no entry get 0%. */
export const schoolAgreements: SchoolAgreement[] = [
  { schoolName: 'AMA University', discountPercentage: 5, note: 'Partner MOA — 5% volume discount' },
  { schoolName: 'De La Salle University', discountPercentage: 10, note: 'Long-term partnership agreement' },
  { schoolName: 'Far Eastern University', discountPercentage: 10, note: 'Promotional rate, Q1 2026 intake' },
  { schoolName: 'PUP', discountPercentage: 0, note: 'Standard rate, no active agreement' },
]

/** Counts non-archived trainees enrolled from a given school, for volume-tier pricing. */
export function countTraineesForSchool(schoolName: string, allTrainees: Trainee[]): number {
  return allTrainees.filter((t) => t.school === schoolName && !t.archived).length
}

export function getPricingTierForCount(count: number): PricingTier {
  return (
    pricingTiers.find((t) => count >= t.minTrainees && (t.maxTrainees === undefined || count <= t.maxTrainees)) ??
    pricingTiers[pricingTiers.length - 1]
  )
}

export function getSchoolAgreement(schoolName: string): SchoolAgreement | undefined {
  return schoolAgreements.find((a) => a.schoolName === schoolName)
}

/** Auto-computes the total training fee: school volume tier rate × the trainee's required hours. */
export function computeAutoTotalAmount(trainee: Trainee, allTrainees: Trainee[]): number {
  const count = countTraineesForSchool(trainee.school, allTrainees)
  const tier = getPricingTierForCount(count)
  return Math.round(tier.ratePerHour * trainee.requiredHrs)
}

/** Auto-computes the discount percentage from the trainee's school agreement, defaulting to 0%. */
export function computeAutoDiscountPercentage(trainee: Trainee): number {
  return getSchoolAgreement(trainee.school)?.discountPercentage ?? 0
}

/** Recomputes total amount + discount from current pricing rules (school volume × hours, plus agreement discount). */
export function autoComputePaymentFields(trainee: Trainee, allTrainees: Trainee[]) {
  const totalAmount = computeAutoTotalAmount(trainee, allTrainees)
  const discountPercentage = computeAutoDiscountPercentage(trainee)
  const totalDiscountAmount = Math.round((totalAmount * discountPercentage) / 100)
  return { totalAmount, discountPercentage, totalDiscountAmount }
}

/** Rolls up a trainee's stored totals + transaction history into the figures shown on the Payment Information tab. */
export function computePaymentBreakdown(trainee: Trainee): PaymentBreakdown {
  const totalAmount = trainee.totalAmount
  const discountPercentage = trainee.discountPercentage
  const totalDiscountAmount = trainee.totalDiscountAmount
  const netAmountDue = Math.max(0, totalAmount - totalDiscountAmount)
  const totalAmountPaid = trainee.payments.reduce((sum, p) => sum + p.amount, 0)
  const outstandingBalance = netAmountDue - totalAmountPaid

  let status: PaymentStatus
  if (netAmountDue === 0 && totalAmountPaid === 0) status = 'Unpaid'
  else if (totalAmountPaid <= 0) status = 'Unpaid'
  else if (outstandingBalance > 0) status = 'Partially paid'
  else if (outstandingBalance === 0) status = 'Fully paid'
  else status = 'Overpaid'

  return { totalAmount, discountPercentage, totalDiscountAmount, netAmountDue, totalAmountPaid, outstandingBalance, status }
}
