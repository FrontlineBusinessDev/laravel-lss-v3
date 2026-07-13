import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Upload, FileWarning } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { useBatches } from '@/context/BatchesContext';
import { parseCsv, validateCsvRows, CSV_TEMPLATE, type ParsedRow } from '@/pages/biometrics/biometricsUtils';
import type { BiometricRecord } from '@/types';
interface ImportCsvModalProps {
  open: boolean;
  onClose: () => void;
  existingRecords: BiometricRecord[];
  onConfirmImport: (fileName: string, validRows: ParsedRow[], totalRows: number, errorRows: number) => void;
}
export function ImportCsvModal({
  open,
  onClose,
  existingRecords,
  onConfirmImport
}: ImportCsvModalProps) {
  const {
    trainees
  } = useBatches();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  function reset() {
    setFileName('');
    setRows(null);
    setFormatError(null);
    setDragOver(false);
  }
  function handleClose() {
    reset();
    onClose();
  }
  function processFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const parsed = parseCsv(text);
      const result = validateCsvRows(parsed, trainees, existingRecords);
      if (result.formatError) {
        setFormatError(result.formatError);
        setRows(null);
      } else {
        setFormatError(null);
        setRows(result.rows);
      }
    };
    reader.onerror = () => setFormatError('Could not read this file. Please try again.');
    reader.readAsText(file);
  }
  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biometrics_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  const validRows = rows?.filter(r => r.errors.length === 0) ?? [];
  const errorRows = rows?.filter(r => r.errors.length > 0) ?? [];
  function handleConfirm() {
    if (!rows) return;
    onConfirmImport(fileName, validRows, rows.length, errorRows.length);
    reset();
  }
  return <Modal open={open} onClose={handleClose} title="Import biometrics CSV" maxWidth={rows ? 720 : 480} data-cy="import-csv-modal-modal-import-biometrics-csv">
      {!rows && !formatError && <div className="flex flex-col gap-3" data-cy="import-csv-modal-div-2">
          <div onDragOver={e => {
        e.preventDefault();
        setDragOver(true);
      }} onDragLeave={() => setDragOver(false)} onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
      }} onClick={() => fileInputRef.current?.click()} className={cn('flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors', dragOver ? 'border-brand-400 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300')} data-cy="import-csv-modal-div-3">
            <Upload size={22} className="text-neutral-400" data-cy="import-csv-modal-upload-4" />
            <p className="text-sm font-medium text-ink" data-cy="import-csv-modal-p-click-to-browse-or-drag-a">Click to browse or drag a CSV file here</p>
            <p className="text-xs text-neutral-400" data-cy="import-csv-modal-p-trainee-name-and-date-columns-are">Trainee Name and Date columns are required.</p>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = '';
        }} data-cy="import-csv-modal-input-file" />
          </div>
          <button onClick={downloadTemplate} className="flex items-center justify-center gap-1.5 self-center text-xs font-medium text-brand-600 hover:underline" data-cy="import-csv-modal-button-download-template">
            <Download size={13} data-cy="import-csv-modal-download-9" /> Download CSV template
          </button>
          <div className="flex justify-end" data-cy="import-csv-modal-div-10">
            <Button variant="secondary" onClick={handleClose} data-cy="import-csv-modal-button-close">Cancel</Button>
          </div>
        </div>}

      {formatError && <div className="flex flex-col gap-4" data-cy="import-csv-modal-div-12">
          <div className="flex items-start gap-2.5 rounded-md border border-danger-100 bg-danger-50 px-3.5 py-3 text-sm text-danger-800" data-cy="import-csv-modal-div-13">
            <FileWarning size={16} className="mt-0.5 shrink-0" data-cy="import-csv-modal-file-warning-14" />
            <span data-cy="import-csv-modal-span-15">{formatError}</span>
          </div>
          <div className="flex justify-end gap-2" data-cy="import-csv-modal-div-16">
            <Button variant="secondary" onClick={handleClose} data-cy="import-csv-modal-button-close-2">Cancel</Button>
            <Button variant="primary" onClick={reset} data-cy="import-csv-modal-button-reset">Try another file</Button>
          </div>
        </div>}

      {rows && <div className="flex flex-col gap-4" data-cy="import-csv-modal-div-19">
          <div className="grid grid-cols-3 gap-3" data-cy="import-csv-modal-div-20">
            <div className="rounded-md border border-neutral-200 p-3 text-center" data-cy="import-csv-modal-div-21">
              <div className="text-lg font-semibold text-ink" data-cy="import-csv-modal-div-22">{rows.length}</div>
              <div className="text-[11px] text-neutral-500" data-cy="import-csv-modal-div-total-rows">Total rows</div>
            </div>
            <div className="rounded-md border border-success-100 bg-success-50 p-3 text-center" data-cy="import-csv-modal-div-24">
              <div className="text-lg font-semibold text-success-800" data-cy="import-csv-modal-div-25">{validRows.length}</div>
              <div className="text-[11px] text-success-700" data-cy="import-csv-modal-div-valid">Valid</div>
            </div>
            <div className="rounded-md border border-danger-100 bg-danger-50 p-3 text-center" data-cy="import-csv-modal-div-27">
              <div className="text-lg font-semibold text-danger-800" data-cy="import-csv-modal-div-28">{errorRows.length}</div>
              <div className="text-[11px] text-danger-700" data-cy="import-csv-modal-div-errors">Errors</div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-md border border-neutral-200 lss-scrollbar" data-cy="import-csv-modal-div-30">
            <table className="w-full border-collapse text-xs" data-cy="import-csv-modal-table-31">
              <thead className="sticky top-0 bg-neutral-50" data-cy="import-csv-modal-thead-32">
                <tr className="text-left font-medium text-neutral-500" data-cy="import-csv-modal-tr-33">
                  <th className="px-3 py-2" data-cy="import-csv-modal-th-row">Row</th>
                  <th className="px-3 py-2" data-cy="import-csv-modal-th-trainee">Trainee</th>
                  <th className="px-3 py-2" data-cy="import-csv-modal-th-date">Date</th>
                  <th className="px-3 py-2" data-cy="import-csv-modal-th-time-in-out">Time in / out</th>
                  <th className="px-3 py-2" data-cy="import-csv-modal-th-status">Status</th>
                </tr>
              </thead>
              <tbody data-cy="import-csv-modal-tbody-39">
                {rows.map(r => <tr key={r.rowNumber} className={cn('border-t border-neutral-100', r.errors.length > 0 && 'bg-danger-50/40')} data-cy="import-csv-modal-tr-40">
                    <td className="px-3 py-2 font-mono text-neutral-500" data-cy="import-csv-modal-td-41">{r.rowNumber}</td>
                    <td className="px-3 py-2 text-ink" data-cy="import-csv-modal-td-42">{r.traineeName || '\u2014'}</td>
                    <td className="px-3 py-2 font-mono text-neutral-600" data-cy="import-csv-modal-td-43">{r.date || '\u2014'}</td>
                    <td className="px-3 py-2 font-mono text-neutral-600" data-cy="import-csv-modal-td-44">{r.timeIn || '\u2014'} / {r.timeOut || '\u2014'}</td>
                    <td className="px-3 py-2" data-cy="import-csv-modal-td-45">
                      {r.errors.length === 0 ? <span className="inline-flex items-center gap-1 text-success-700" data-cy="import-csv-modal-span-ok"><CheckCircle2 size={12} data-cy="import-csv-modal-check-circle2-47" /> OK</span> : <span className="inline-flex items-start gap-1 text-danger-700" data-cy="import-csv-modal-span-48">
                          <AlertCircle size={12} className="mt-0.5 shrink-0" data-cy="import-csv-modal-alert-circle-49" />
                          <span data-cy="import-csv-modal-span-50">{r.errors.join(' ')}</span>
                        </span>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral-500" data-cy="import-csv-modal-p-51">
            {errorRows.length === 0 ? 'All rows look good. Confirming will add these attendance records.' : `${errorRows.length} row${errorRows.length === 1 ? '' : 's'} will be skipped due to the errors above. Only valid rows will be imported.`}
          </p>

          <div className="flex justify-end gap-2" data-cy="import-csv-modal-div-52">
            <Button variant="secondary" onClick={handleClose} data-cy="import-csv-modal-button-close-3">Cancel</Button>
            <Button variant="primary" onClick={handleConfirm} disabled={validRows.length === 0} data-cy="import-csv-modal-button-confirm">
              Confirm import ({validRows.length})
            </Button>
          </div>
        </div>}
    </Modal>;
}