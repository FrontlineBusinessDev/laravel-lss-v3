/**
 * Canonical program types offered across the system. This is the single source of
 * truth — Batches (create/edit), Trainees (academic info), and Settings (industry
 * mapping) all pull from here instead of keeping their own copies, which had drifted
 * out of sync (different casing, "Seminar" listed as a batch type despite Seminars
 * now being its own module, "Vocational OJT" only existing in one of the four lists).
 */
export const PROGRAM_TYPES = [
  'College OJT',
  'Senior HS work immersion',
  'Vocational OJT',
  'Upskill training',
  'Continuing Studies',
] as const

export type ProgramType = (typeof PROGRAM_TYPES)[number]
