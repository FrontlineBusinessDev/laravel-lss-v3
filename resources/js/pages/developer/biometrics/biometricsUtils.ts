import type { BiometricImportRowInput } from '@/types/modules/biometrics/biometrics'

/** Minimal trainee shape CSV rows are matched against — id + name + batch code. */
export interface CsvTrainee {
  id: number
  name: string
  batchCode: string
}

export function missingPunchLabel(exceptions: string[]): string {
  if (exceptions.length === 0) return ''
  if (exceptions.length === 1) return exceptions[0]
  return `${exceptions.length} missing punches`
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, embedded commas, and doubled-quote escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    rows.push(row)
    row = []
  }

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]
    if (inQuotes) {
      if (ch === '"') {
        if (normalized[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      pushField()
    } else if (ch === '\n') {
      pushRow()
    } else {
      field += ch
    }
  }
  if (field.length > 0 || row.length > 0) pushRow()

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const REQUIRED_HEADERS = ['trainee name', 'date']

export interface ParsedRow {
  rowNumber: number // 1-based, matches spreadsheet row (header is row 1)
  traineeId: number | null
  traineeName: string
  batchCode: string
  date: string
  morningTimeIn: string
  lunchTimeOut: string
  afternoonTimeIn: string
  dayTimeOut: string
  onLeave: string
  remarks: string
  errors: string[]
}

export interface CsvValidationResult {
  formatError?: string // set when the file itself is unusable (missing required columns, unreadable, etc.)
  rows: ParsedRow[]
}

/**
 * Validates parsed CSV rows against required fields, known trainees, formats,
 * and duplicate entries (both within the file and against existing records).
 * Server-side re-validates the same rules on POST /biometrics/import — this
 * is purely a fast, friendly preview before submitting.
 */
export function validateCsvRows(raw: string[][], trainees: CsvTrainee[], existing: { traineeId: number; date: string }[]): CsvValidationResult {
  if (raw.length === 0) {
    return { formatError: 'The file is empty.', rows: [] }
  }

  const header = raw[0].map((h) => h.trim().toLowerCase())
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !header.includes(h))
  if (missingHeaders.length > 0) {
    return {
      formatError: `Invalid file format — missing required column(s): ${missingHeaders.join(', ')}. Expected headers: Trainee Name, Batch, Date, Morning Time In, Lunch Out, After Lunch Time In, Day Time Out, On Leave, Remarks.`,
      rows: [],
    }
  }

  const col = (name: string) => header.indexOf(name)
  const idx = {
    trainee: col('trainee name'),
    batch: col('batch'),
    date: col('date'),
    morningTimeIn: col('morning time in'),
    lunchTimeOut: col('lunch out'),
    afternoonTimeIn: col('after lunch time in'),
    dayTimeOut: col('day time out'),
    onLeave: col('on leave'),
    remarks: col('remarks'),
  }

  const seenInFile = new Set<string>()
  const traineeByName = new Map(trainees.map((t) => [t.name.trim().toLowerCase(), t]))

  const rows: ParsedRow[] = raw.slice(1).map((cells, i) => {
    const get = (colIdx: number) => (colIdx >= 0 ? (cells[colIdx] ?? '').trim() : '')
    const traineeName = get(idx.trainee)
    const batchCode = get(idx.batch)
    const date = get(idx.date)
    const morningTimeIn = get(idx.morningTimeIn)
    const lunchTimeOut = get(idx.lunchTimeOut)
    const afternoonTimeIn = get(idx.afternoonTimeIn)
    const dayTimeOut = get(idx.dayTimeOut)
    const onLeaveRaw = get(idx.onLeave)
    const remarks = get(idx.remarks)
    const errors: string[] = []

    const trainee = traineeByName.get(traineeName.trim().toLowerCase())
    if (!traineeName) errors.push('Trainee name is required.')
    else if (!trainee) errors.push('Unknown trainee name — no matching trainee record.')

    if (trainee && batchCode && batchCode !== trainee.batchCode) {
      errors.push(`Batch "${batchCode}" does not match ${trainee.name}’s assigned batch (${trainee.batchCode}).`)
    }

    if (!date) errors.push('Date is required.')
    else if (!DATE_RE.test(date)) errors.push('Invalid date format — expected YYYY-MM-DD.')

    for (const [label, value] of [
      ['Morning Time In', morningTimeIn],
      ['Lunch Out', lunchTimeOut],
      ['After Lunch Time In', afternoonTimeIn],
      ['Day Time Out', dayTimeOut],
    ] as const) {
      if (value && !TIME_RE.test(value)) errors.push(`Invalid ${label} — expected HH:MM (24-hour).`)
    }

    const onLeaveNormalized = onLeaveRaw.toLowerCase()
    const validLeaveValues = ['', 'yes', 'no', 'true', 'false']
    if (!validLeaveValues.includes(onLeaveNormalized)) errors.push('Invalid "On Leave" value — expected Yes or No.')

    if (trainee && date && DATE_RE.test(date)) {
      const dupKey = `${trainee.id}__${date}`
      const existsAlready = existing.some((r) => r.traineeId === trainee.id && r.date === date)
      if (seenInFile.has(dupKey)) errors.push('Duplicate entry — this trainee and date already appear earlier in this file.')
      else if (existsAlready) errors.push('Duplicate entry — a record for this trainee and date already exists.')
      seenInFile.add(dupKey)
    }

    return {
      rowNumber: i + 2, // +1 for 0-index, +1 because row 1 is the header
      traineeId: trainee?.id ?? null,
      traineeName,
      batchCode,
      date,
      morningTimeIn,
      lunchTimeOut,
      afternoonTimeIn,
      dayTimeOut,
      onLeave: onLeaveNormalized === 'yes' || onLeaveNormalized === 'true' ? 'Yes' : 'No',
      remarks,
      errors,
    }
  })

  return { rows }
}

export const CSV_TEMPLATE =
  'Trainee Name,Batch,Date,Morning Time In,Lunch Out,After Lunch Time In,Day Time Out,On Leave,Remarks\nJuan Dela Cruz,B-2026-042,2026-07-01,08:00,12:00,13:00,17:00,No,\n'

/** Converts a validated CSV row into the payload shape the import endpoint accepts. */
export function toImportRow(row: ParsedRow): BiometricImportRowInput {
  return {
    trainee_id: row.traineeId as number,
    date: row.date,
    morning_time_in: row.onLeave === 'Yes' ? null : row.morningTimeIn || null,
    lunch_time_out: row.onLeave === 'Yes' ? null : row.lunchTimeOut || null,
    afternoon_time_in: row.onLeave === 'Yes' ? null : row.afternoonTimeIn || null,
    day_time_out: row.onLeave === 'Yes' ? null : row.dayTimeOut || null,
    on_leave: row.onLeave === 'Yes',
    remarks: row.remarks || null,
  }
}

/** A short, auto-generated summary remark for a trainee's attendance records, used in the summary view and printable report. */
export function summarizeAttendance(rows: { on_leave: boolean; exceptions: string[] }[]): string {
  const leaveDays = rows.filter((r) => r.on_leave).length
  const flaggedDays = rows.filter((r) => !r.on_leave && r.exceptions.length > 0).length
  const parts: string[] = []
  if (flaggedDays > 0) parts.push(`${flaggedDays} day${flaggedDays === 1 ? '' : 's'} flagged for missing punches`)
  if (leaveDays > 0) parts.push(`${leaveDays} approved leave day${leaveDays === 1 ? '' : 's'}`)
  return parts.length > 0 ? parts.join('; ') : 'No issues noted'
}
