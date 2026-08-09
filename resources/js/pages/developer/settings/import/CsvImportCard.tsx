import { useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/Button';
import { settingsImportService, type SettingsImportResult } from '@/api-service-layer/developer/settingsImport';
import { csvRowsToObjects, downloadCsvTemplate, type ImportStepConfig } from './importUtils';

/** One self-contained CSV upload + import card for a single Settings > Import phase/step. */
export function CsvImportCard({ step }: { step: ImportStepConfig }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');
    const [rows, setRows] = useState<Record<string, string>[] | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<SettingsImportResult | null>(null);
    const [readError, setReadError] = useState<string | null>(null);

    function processFile(file: File) {
        setFileName(file.name);
        setResult(null);
        setReadError(null);
        const reader = new FileReader();
        reader.onload = () => {
            const { rows: parsed } = csvRowsToObjects(String(reader.result ?? ''));
            if (parsed.length === 0) {
                setReadError('The file is empty or could not be parsed.');
                setRows(null);
            } else {
                setRows(parsed);
            }
        };
        reader.onerror = () => setReadError('Could not read this file. Please try again.');
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!rows) return;
        setImporting(true);
        try {
            const res = await settingsImportService.import(step.endpoint, fileName || 'import.csv', rows);
            setResult(res);
            setRows(null);
        } catch {
            setReadError('Import failed — check the file and try again.');
        } finally {
            setImporting(false);
        }
    }

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4" data-cy={`import-card-${step.key}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                    <p className="mt-0.5 text-xs text-neutral-500">{step.description}</p>
                </div>
                <button
                    onClick={() => downloadCsvTemplate(step.templateFileName, step.template)}
                    className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                    <Download size={12} /> Template
                </button>
            </div>

            <div className="flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFile(file);
                        e.target.value = '';
                    }}
                />
                <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                    {fileName || 'Choose CSV file'}
                </Button>
                {rows && (
                    <Button variant="primary" size="sm" disabled={importing} onClick={() => void handleImport()}>
                        {importing ? 'Importing…' : `Import (${rows.length} rows)`}
                    </Button>
                )}
            </div>

            {readError && (
                <p className="mt-2 flex items-center gap-1.5 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs text-danger-700">
                    <AlertCircle size={13} /> {readError}
                </p>
            )}

            {result && (
                <div className="mt-3 rounded-md border border-neutral-200 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                        {result.log.status === 'success' && <CheckCircle2 size={13} className="text-success-600" />}
                        {result.log.status !== 'success' && <AlertTriangle size={13} className="text-warning-600" />}
                        {result.created_count} of {result.log.total_rows} rows imported ({result.log.status}).
                    </div>
                    {result.errors.length > 0 && (
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-danger-700">
                            {result.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    )}
                    {result.warnings.length > 0 && (
                        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-warning-700">
                            {result.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
