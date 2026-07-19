import type { SeminarCertificateRow, TraineeCertificateRow } from './types';

/** Tokens available for substitution inside a citation's bodyText. */
export interface CitationTokens {
  name?: string;
  school?: string;
  program?: string;
  industry?: string;
  hours?: string | number;
  seminarTopic?: string;
  date?: string;
}

/** Replaces {{token}} placeholders in a citation body with the given values. Unknown/missing tokens collapse to an em dash. */
export function renderCitation(bodyText: string, tokens: CitationTokens): string {
  return bodyText.replace(/{{\s*(\w+)\s*}}/g, (_match, key: string) => {
    const value = (tokens as Record<string, string | number | undefined>)[key];
    return value !== undefined && value !== '' ? String(value) : '—';
  });
}

export function tokensForTrainee(row: TraineeCertificateRow): CitationTokens {
  return {
    name: traineeFullName(row),
    school: row.school?.school_name,
    hours: row.required_hours,
  };
}

export function tokensForSeminarParticipant(row: SeminarCertificateRow): CitationTokens {
  return {
    name: row.name,
    seminarTopic: row.seminar?.topic,
  };
}

function traineeFullName(row: TraineeCertificateRow): string {
  return `${row.first_name} ${row.last_name}`.trim();
}
