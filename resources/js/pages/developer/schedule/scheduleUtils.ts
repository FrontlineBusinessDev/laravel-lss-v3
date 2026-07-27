import type { StatusKind } from '@/types/reusable/status-kind'
import type { ScheduleApiBatch, ScheduleApiEntry, ScheduleApiTrainee } from '@/types/modules/schedule/schedule'

/**
 * A single row on the Schedule board: one batch, enriched with the trainee
 * data needed to satisfy the Schedule user stories (computed timeline,
 * school breakdown for color coding, program/industry rollups).
 */
export interface ScheduleEntry {
  batch: ScheduleApiBatch
  trainees: ScheduleApiTrainee[]
  /** Earliest trainee start date in the batch (batch.date_started, per-trainee start dates aren't tracked). */
  start: Date
  /** Latest real-or-projected trainee completion date in the batch. */
  end: Date
  /** Trainee count per school, sorted descending. */
  schoolCounts: { school: string; count: number }[]
  /** The school with the most trainees in this batch — used for the entry's primary color. */
  primarySchool: string
  /** Distinct academic programs represented in this batch. */
  programs: string[]
  status: StatusKind
}

/** Parses the ISO date strings returned by ScheduleController; falls back to "now" if absent/invalid. */
export function parseAnyDate(value: string | null | undefined): Date {
  const d = new Date(value ?? '')
  return isNaN(d.getTime()) ? new Date() : d
}

/** Adapts the server-computed schedule entries (already aggregated in PHP) into display-ready ScheduleEntry rows. */
export function adaptScheduleEntries(apiEntries: ScheduleApiEntry[]): ScheduleEntry[] {
  return apiEntries.map((entry) => ({
    batch: entry.batch,
    trainees: entry.trainees,
    start: parseAnyDate(entry.start),
    end: parseAnyDate(entry.end),
    schoolCounts: entry.school_counts,
    primarySchool: entry.primary_school,
    programs: entry.programs,
    status: entry.batch.status as StatusKind,
  }))
}

// ---------------------------------------------------------------------------
// School color coding
// ---------------------------------------------------------------------------

export interface SchoolColor {
  solid: string // for bars/dots
  bg: string // soft background
  border: string
  text: string
}

const SCHOOL_PALETTE: SchoolColor[] = [
  { solid: '#2176E3', bg: '#E6F1FB', border: '#85B7EB', text: '#0C447C' }, // blue
  { solid: '#7C3AED', bg: '#F1EAFB', border: '#C4B0F5', text: '#5B21B6' }, // violet
  { solid: '#0D9488', bg: '#E4F5F3', border: '#8FD4CB', text: '#0F5D53' }, // teal
  { solid: '#D97706', bg: '#FBEEDA', border: '#F3C583', text: '#854F0B' }, // amber
  { solid: '#E24B4A', bg: '#FCEBEB', border: '#F0A6A5', text: '#A32D2D' }, // rose
  { solid: '#639922', bg: '#EAF3DE', border: '#B7D999', text: '#3B6D11' }, // green
  { solid: '#4F46E5', bg: '#E8E9FB', border: '#B7B7F0', text: '#3730A3' }, // indigo
  { solid: '#0891B2', bg: '#E2F5FA', border: '#8FD3E6', text: '#0E5A6B' }, // cyan
  { solid: '#DB2777', bg: '#FBE7F1', border: '#F2A9CB', text: '#9D174D' }, // pink
  { solid: '#65A30D', bg: '#EFF6E4', border: '#C3DE9C', text: '#3F6212' }, // lime
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const colorCache = new Map<string, SchoolColor>()

/** Deterministic color assignment per school name, stable across renders/sessions. */
export function getSchoolColor(school: string): SchoolColor {
  if (!school || school === 'Unassigned') {
    return { solid: '#9AA2AB', bg: '#F6F7F9', border: '#DDE1E6', text: '#4F565D' }
  }
  const cached = colorCache.get(school)
  if (cached) return cached
  const color = SCHOOL_PALETTE[hashString(school) % SCHOOL_PALETTE.length]
  colorCache.set(school, color)
  return color
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

export function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function toKeyFromDate(d: Date): string {
  return toKey(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Builds a map of every calendar day -> the schedule entries whose timeline covers that day (capped for safety). */
export function buildDayCoverageIndex(entries: ScheduleEntry[], year: number): Map<string, ScheduleEntry[]> {
  const map = new Map<string, ScheduleEntry[]>()
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)

  for (const entry of entries) {
    const rangeStart = entry.start < yearStart ? yearStart : entry.start
    const rangeEnd = entry.end > yearEnd ? yearEnd : entry.end
    if (rangeStart > rangeEnd) continue

    const cursor = new Date(rangeStart)
    let guard = 0
    while (cursor <= rangeEnd && guard < 400) {
      const key = toKeyFromDate(cursor)
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
      cursor.setDate(cursor.getDate() + 1)
      guard++
    }
  }
  return map
}
