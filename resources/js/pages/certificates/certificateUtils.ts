import type { CertificateCitation, Trainee, SeminarParticipant, Seminar } from '@/types'

/** Tokens available for substitution inside a citation's bodyText. */
export interface CitationTokens {
  name?: string
  school?: string
  program?: string
  industry?: string
  hours?: string | number
  dateStarted?: string
  dateCompleted?: string
  seminarTopic?: string
  date?: string
}

/** Replaces {{token}} placeholders in a citation body with the given values. Unknown/missing tokens collapse to an em dash. */
export function renderCitation(bodyText: string, tokens: CitationTokens): string {
  return bodyText.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => {
    const value = (tokens as Record<string, string | number | undefined>)[key]
    return value !== undefined && value !== '' ? String(value) : '\u2014'
  })
}

export function formatDateLong(iso?: string): string {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function tokensForTrainee(trainee: Trainee): CitationTokens {
  return {
    name: trainee.name,
    school: trainee.school,
    program: trainee.programType,
    industry: trainee.industry,
    hours: trainee.requiredHrs,
    dateStarted: formatDateLong(trainee.dateStarted),
    dateCompleted: formatDateLong(trainee.dateCompleted),
    date: formatDateLong(trainee.dateCompleted),
  }
}

export function tokensForSeminarParticipant(participant: SeminarParticipant, seminar?: Seminar): CitationTokens {
  return {
    name: participant.name,
    seminarTopic: participant.seminarTopic,
    date: formatDateLong(seminar?.date),
    industry: seminar?.type,
  }
}

/** Citations selectable for a given certificate context, always including the currently-assigned one even if archived. */
export function selectableCitations(
  citations: CertificateCitation[],
  appliesTo: 'Trainee' | 'Seminar',
  currentCitationId?: string,
): CertificateCitation[] {
  return citations.filter(
    (c) => (c.status === 'active' || c.id === currentCitationId) && (c.appliesTo === appliesTo || c.appliesTo === 'Both'),
  )
}
