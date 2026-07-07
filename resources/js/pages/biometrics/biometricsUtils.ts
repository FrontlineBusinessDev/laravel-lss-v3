import type { BiometricRecord, Trainee } from '@/types'

export function missingPunchLabel(record: Pick<BiometricRecord, 'timeIn' | 'timeOut'>): string {
  if (!record.timeIn && !record.timeOut) return 'Missing time in & time out'
  if (!record.timeIn) return 'Missing time in'
  return 'Missing time out'
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
  traineeName: string
  batchNo: string
  date: string
  timeIn: string
  timeOut: string
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
 */
export function validateCsvRows(raw: string[][], trainees: Trainee[], existing: BiometricRecord[]): CsvValidationResult {
  if (raw.length === 0) {
    return { formatError: 'The file is empty.', rows: [] }
  }

  const header = raw[0].map((h) => h.trim().toLowerCase())
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !header.includes(h))
  if (missingHeaders.length > 0) {
    return {
      formatError: `Invalid file format \u2014 missing required column(s): ${missingHeaders.join(', ')}. Expected headers: Trainee Name, Batch, Date, Time In, Time Out, On Leave, Remarks.`,
      rows: [],
    }
  }

  const col = (name: string) => header.indexOf(name)
  const idx = {
    trainee: col('trainee name'),
    batch: col('batch'),
    date: col('date'),
    timeIn: col('time in'),
    timeOut: col('time out'),
    onLeave: col('on leave'),
    remarks: col('remarks'),
  }

  const seenInFile = new Set<string>()
  const traineeByName = new Map(trainees.map((t) => [t.name.trim().toLowerCase(), t]))

  const rows: ParsedRow[] = raw.slice(1).map((cells, i) => {
    const get = (colIdx: number) => (colIdx >= 0 ? (cells[colIdx] ?? '').trim() : '')
    const traineeName = get(idx.trainee)
    const batchNo = get(idx.batch)
    const date = get(idx.date)
    const timeIn = get(idx.timeIn)
    const timeOut = get(idx.timeOut)
    const onLeaveRaw = get(idx.onLeave)
    const remarks = get(idx.remarks)
    const errors: string[] = []

    const trainee = traineeByName.get(traineeName.trim().toLowerCase())
    if (!traineeName) errors.push('Trainee name is required.')
    else if (!trainee) errors.push('Unknown trainee name \u2014 no matching trainee record.')

    if (trainee && batchNo && batchNo !== trainee.batchNo) {
      errors.push(`Batch "${batchNo}" does not match ${trainee.name}\u2019s assigned batch (${trainee.batchNo}).`)
    }

    if (!date) errors.push('Date is required.')
    else if (!DATE_RE.test(date)) errors.push('Invalid date format \u2014 expected YYYY-MM-DD.')

    if (timeIn && !TIME_RE.test(timeIn)) errors.push('Invalid Time In \u2014 expected HH:MM (24-hour).')
    if (timeOut && !TIME_RE.test(timeOut)) errors.push('Invalid Time Out \u2014 expected HH:MM (24-hour).')

    const onLeaveNormalized = onLeaveRaw.toLowerCase()
    const validLeaveValues = ['', 'yes', 'no', 'true', 'false']
    if (!validLeaveValues.includes(onLeaveNormalized)) errors.push('Invalid "On Leave" value \u2014 expected Yes or No.')

    if (trainee && date && DATE_RE.test(date)) {
      const dupKey = `${trainee.id}__${date}`
      const existsAlready = existing.some((r) => r.traineeId === trainee.id && r.date === date)
      if (seenInFile.has(dupKey)) errors.push('Duplicate entry \u2014 this trainee and date already appear earlier in this file.')
      else if (existsAlready) errors.push('Duplicate entry \u2014 a record for this trainee and date already exists.')
      seenInFile.add(dupKey)
    }

    return {
      rowNumber: i + 2, // +1 for 0-index, +1 because row 1 is the header
      traineeName,
      batchNo,
      date,
      timeIn,
      timeOut,
      onLeave: onLeaveNormalized === 'yes' || onLeaveNormalized === 'true' ? 'Yes' : 'No',
      remarks,
      errors,
    }
  })

  return { rows }
}

export const CSV_TEMPLATE = 'Trainee Name,Batch,Date,Time In,Time Out,On Leave,Remarks\nJuan Dela Cruz,B-2026-042,2026-07-01,08:00,17:00,No,\n'

/** A short, auto-generated summary remark for a trainee's attendance records, used in the summary view and printable report. */
export function summarizeAttendance(records: Pick<BiometricRecord, 'onLeave' | 'timeIn' | 'timeOut'>[]): string {
  const leaveDays = records.filter((r) => r.onLeave).length
  const flaggedDays = records.filter((r) => !r.onLeave && (!r.timeIn || !r.timeOut)).length
  const parts: string[] = []
  if (flaggedDays > 0) parts.push(`${flaggedDays} day${flaggedDays === 1 ? '' : 's'} flagged for missing punches`)
  if (leaveDays > 0) parts.push(`${leaveDays} approved leave day${leaveDays === 1 ? '' : 's'}`)
  return parts.length > 0 ? parts.join('; ') : 'No issues noted'
}
