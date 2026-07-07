import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Upload, FileWarning } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { useBatches } from '@/context/BatchesContext'
import { parseCsv, validateCsvRows, CSV_TEMPLATE, type ParsedRow } from '@/pages/biometrics/biometricsUtils'
import type { BiometricRecord } from '@/types'

interface ImportCsvModalProps {
  open: boolean
  onClose: () => void
  existingRecords: BiometricRecord[]
  onConfirmImport: (fileName: string, validRows: ParsedRow[], totalRows: number, errorRows: number) => void
}

export function ImportCsvModal({ open, onClose, existingRecords, onConfirmImport }: ImportCsvModalProps) {
  const { trainees } = useBatches()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [formatError, setFormatError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function reset() {
    setFileName('')
    setRows(null)
    setFormatError(null)
    setDragOver(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function processFile(file: File) {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const parsed = parseCsv(text)
      const result = validateCsvRows(parsed, trainees, existingRecords)
      if (result.formatError) {
        setFormatError(result.formatError)
        setRows(null)
      } else {
        setFormatError(null)
        setRows(result.rows)
      }
    }
    reader.onerror = () => setFormatError('Could not read this file. Please try again.')
    reader.readAsText(file)
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'biometrics_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validRows = rows?.filter((r) => r.errors.length === 0) ?? []
  const errorRows = rows?.filter((r) => r.errors.length > 0) ?? []

  function handleConfirm() {
    if (!rows) return
    onConfirmImport(fileName, validRows, rows.length, errorRows.length)
    reset()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import biometrics CSV" maxWidth={rows ? 720 : 480}>
      {!rows && !formatError && (
        <div className="flex flex-col gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files?.[0]
              if (file) processFile(file)
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              dragOver ? 'border-brand-400 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300',
            )}
          >
            <Upload size={22} className="text-neutral-400" />
            <p className="text-sm font-medium text-ink">Click to browse or drag a CSV file here</p>
            <p className="text-xs text-neutral-400">Trainee Name and Date columns are required.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) processFile(file)
                e.target.value = ''
              }}
            />
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-1.5 self-center text-xs font-medium text-brand-600 hover:underline"
          >
            <Download size={13} /> Download CSV template
          </button>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      )}

      {formatError && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 rounded-md border border-danger-100 bg-danger-50 px-3.5 py-3 text-sm text-danger-800">
            <FileWarning size={16} className="mt-0.5 shrink-0" />
            <span>{formatError}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={reset}>Try another file</Button>
          </div>
        </div>
      )}

      {rows && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-neutral-200 p-3 text-center">
              <div className="text-lg font-semibold text-ink">{rows.length}</div>
              <div className="text-[11px] text-neutral-500">Total rows</div>
            </div>
            <div className="rounded-md border border-success-100 bg-success-50 p-3 text-center">
              <div className="text-lg font-semibold text-success-800">{validRows.length}</div>
              <div className="text-[11px] text-success-700">Valid</div>
            </div>
            <div className="rounded-md border border-danger-100 bg-danger-50 p-3 text-center">
              <div className="text-lg font-semibold text-danger-800">{errorRows.length}</div>
              <div className="text-[11px] text-danger-700">Errors</div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border border-neutral-200 lss-scrollbar">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-neutral-50">
                <tr className="text-left font-medium text-neutral-500">
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Trainee</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time in / out</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className={cn('border-t border-neutral-100', r.errors.length > 0 && 'bg-danger-50/40')}>
                    <td className="px-3 py-2 font-mono text-neutral-500">{r.rowNumber}</td>
                    <td className="px-3 py-2 text-ink">{r.traineeName || '\u2014'}</td>
                    <td className="px-3 py-2 font-mono text-neutral-600">{r.date || '\u2014'}</td>
                    <td className="px-3 py-2 font-mono text-neutral-600">{r.timeIn || '\u2014'} / {r.timeOut || '\u2014'}</td>
                    <td className="px-3 py-2">
                      {r.errors.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-success-700"><CheckCircle2 size={12} /> OK</span>
                      ) : (
                        <span className="inline-flex items-start gap-1 text-danger-700">
                          <AlertCircle size={12} className="mt-0.5 shrink-0" />
                          <span>{r.errors.join(' ')}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral-500">
            {errorRows.length === 0
              ? 'All rows look good. Confirming will add these attendance records.'
              : `${errorRows.length} row${errorRows.length === 1 ? '' : 's'} will be skipped due to the errors above. Only valid rows will be imported.`}
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={validRows.length === 0}>
              Confirm import ({validRows.length})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
