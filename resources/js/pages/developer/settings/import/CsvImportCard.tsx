import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Download,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { settingsImportService } from '@/api-service-layer/developer/settingsImport';
import { useAsyncOperations } from '@/components/AsyncOperations';
import { Button } from '@/components/Button';
import { ApiError } from '@/lib/apiFetch';
import {
    chunkArray,
    csvRowsToObjects,
    downloadCsvTemplate,
    IMPORT_CHUNK_SIZE,
} from './importUtils';
import type { ImportStepConfig } from './importUtils';

interface AggregatedImportResult {
    status: 'success' | 'partial' | 'failed';
    totalRows: number;
    createdCount: number;
    errors: string[];
    warnings: string[];
}

/** One self-contained CSV upload + import card for a single Settings > Import phase/step. */
export function CsvImportCard({
    step,
    onImported,
}: {
    step: ImportStepConfig;
    onImported?: () => void;
}) {
    const { track } = useAsyncOperations();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');
    const [rows, setRows] = useState<Record<string, string>[] | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<AggregatedImportResult | null>(null);
    const [readError, setReadError] = useState<string | null>(null);

    function processFile(file: File) {
        setFileName(file.name);
        setResult(null);
        setReadError(null);
        const reader = new FileReader();
        reader.onload = () => {
            const { rows: parsed } = csvRowsToObjects(
                String(reader.result ?? ''),
            );

            if (parsed.length === 0) {
                setReadError('The file is empty or could not be parsed.');
                setRows(null);
            } else {
                setRows(parsed);
            }
        };
        reader.onerror = () =>
            setReadError('Could not read this file. Please try again.');
        reader.readAsText(file);
    }

    async function handleImport() {
        if (!rows) {
            return;
        }

        setImporting(true);
        setReadError(null);
        setResult(null);

        const chunks = chunkArray(rows, IMPORT_CHUNK_SIZE);
        const totalRows = rows.length;
        const opId = `import-${step.key}-${Date.now()}`;

        track(opId, {
            label: `Importing ${step.title}…`,
            total: totalRows,
            run: async (helpers) => {
                const aggregate: AggregatedImportResult = {
                    status: 'success',
                    totalRows: 0,
                    createdCount: 0,
                    errors: [],
                    warnings: [],
                };
                let rowsDone = 0;

                for (const chunk of chunks) {
                    if (helpers.isCancelled()) {
                        setResult({
                            ...aggregate,
                            status:
                                aggregate.createdCount === 0
                                    ? 'failed'
                                    : 'partial',
                        });
                        setRows(null);

                        return { status: 'cancelled' as const };
                    }

                    let res: Awaited<
                        ReturnType<typeof settingsImportService.import>
                    > | null = null;

                    // Only an actual connection drop (no response at all — status 0,
                    // see ApiError/toApiError in api-service-layer/client.ts) should
                    // pause here for Retry; a real server rejection (validation,
                    // 500, etc.) should fail the whole import outright.
                    for (;;) {
                        try {
                            res = await settingsImportService.import(
                                step.endpoint,
                                fileName || 'import.csv',
                                chunk,
                            );
                            break;
                        } catch (err) {
                            if (err instanceof ApiError && err.status !== 0) {
                                throw err;
                            }

                            helpers.report({ status: 'offline' });
                            await new Promise<void>((resolve) =>
                                helpers.onRetry(resolve),
                            );

                            if (helpers.isCancelled()) {
                                setResult({
                                    ...aggregate,
                                    status:
                                        aggregate.createdCount === 0
                                            ? 'failed'
                                            : 'partial',
                                });
                                setRows(null);

                                return { status: 'cancelled' as const };
                            }

                            helpers.report({ status: 'running' });
                        }
                    }

                    aggregate.totalRows += res.log.total_rows;
                    aggregate.createdCount += res.created_count;
                    aggregate.errors.push(...res.errors);
                    aggregate.warnings.push(...res.warnings);

                    rowsDone += chunk.length;
                    helpers.report({ processed: rowsDone });
                }

                aggregate.status =
                    aggregate.errors.length === 0
                        ? 'success'
                        : aggregate.createdCount === 0
                          ? 'failed'
                          : 'partial';
                setResult(aggregate);
                setRows(null);
                onImported?.();

                return {
                    status:
                        aggregate.status === 'failed'
                            ? ('failed' as const)
                            : ('completed' as const),
                };
            },
            onSettled: () => setImporting(false),
        });
    }

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white p-4"
            data-cy={`import-card-${step.key}`}
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-ink">
                        {step.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                        {step.description}
                    </p>
                </div>
                <button
                    onClick={() =>
                        downloadCsvTemplate(
                            step.templateFileName,
                            step.template,
                        )
                    }
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

                        if (file) {
                            processFile(file);
                        }

                        e.target.value = '';
                    }}
                />
                <Button
                    variant="secondary"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {fileName || 'Choose CSV file'}
                </Button>
                {rows && (
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={importing}
                        onClick={() => void handleImport()}
                    >
                        {importing
                            ? 'Importing…'
                            : `Import (${rows.length} rows)`}
                    </Button>
                )}
            </div>

            {readError && (
                <p className="text-danger-700 mt-2 flex items-center gap-1.5 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs">
                    <AlertCircle size={13} /> {readError}
                </p>
            )}

            {result && (
                <div className="mt-3 rounded-md border border-neutral-200 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                        {result.status === 'success' && (
                            <CheckCircle2
                                size={13}
                                className="text-success-600"
                            />
                        )}
                        {result.status !== 'success' && (
                            <AlertTriangle
                                size={13}
                                className="text-warning-600"
                            />
                        )}
                        {result.createdCount} of {result.totalRows} rows
                        imported ({result.status}).
                    </div>
                    {result.errors.length > 0 && (
                        <ul className="text-danger-700 mt-1.5 max-h-64 list-disc space-y-0.5 overflow-y-auto pl-4">
                            {result.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    )}
                    {result.warnings.length > 0 && (
                        <ul className="text-warning-700 mt-1.5 max-h-64 list-disc space-y-0.5 overflow-y-auto pl-4">
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
