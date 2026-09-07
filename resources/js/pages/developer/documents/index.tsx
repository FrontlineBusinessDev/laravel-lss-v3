import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import {
    AttachmentViewerModal,
    type ViewableAttachment,
} from '@/components/modal/AttachmentViewerModal';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { cn } from '@/lib/utils';
import {
    columns,
    documentTypeLabel,
    formatUploadedAt,
    humanFileSize,
    type DocumentRow,
} from '@/types/modules/developer/documents';

const GRID = 'sm:grid sm:grid-cols-[1.6fr_1.4fr_1.2fr_1fr_2.5rem_2.5rem] sm:items-center sm:gap-3';

const listHeader = (
    <div
        className={cn(
            'hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500',
            GRID,
        )}
        data-cy="documents-index-list-header"
    >
        <span>Trainee</span>
        <span>Document type</span>
        <span>Uploaded</span>
        <span>File</span>
        <span className="text-right">View</span>
        <span className="text-right">Download</span>
    </div>
);

/** Admin/developer master list of every trainee document across every trainee. Read-only. */
export default function DocumentsIndex() {
    const [previewing, setPreviewing] = useState<ViewableAttachment | null>(
        null,
    );

    function renderRow(row: DocumentRow) {
        const canPreview = !row.file_missing && !!(row.view_url || row.download_url);
        return (
            <div
                className={cn('px-4 py-3 text-sm', GRID)}
                data-cy="documents-index-row"
            >
                <div className="min-w-0" data-cy="documents-index-div-trainee">
                    <div className="truncate font-medium text-ink">
                        {row.trainee_name || '—'}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                        {row.batch_code ?? '—'}
                    </div>
                </div>
                <span className="text-xs text-neutral-700">
                    {documentTypeLabel(row.document_type)}
                </span>
                <span className="font-mono text-xs text-neutral-600">
                    {formatUploadedAt(row.created_at)}
                </span>
                <div className="min-w-0 truncate text-xs text-neutral-500">
                    {row.file_missing
                        ? 'File unavailable'
                        : (row.original_name ?? row.file_name ?? (row.url_link ? 'Link' : '—'))}
                    {!row.file_missing && row.file_size ? (
                        <span className="ml-1 text-neutral-400">
                            ({humanFileSize(row.file_size)})
                        </span>
                    ) : null}
                </div>
                <div className="flex justify-end">
                    <TooltipIconButton
                        icon={Eye}
                        label="Preview document"
                        disabled={!canPreview}
                        onClick={() =>
                            setPreviewing({
                                id: row.id,
                                original_name:
                                    row.original_name ?? row.file_name ?? 'Document',
                                mime_type: row.mime_type ?? 'application/octet-stream',
                                file_size: row.file_size ?? 0,
                                view_url: row.view_url ?? '',
                                download_url: row.download_url ?? '',
                            })
                        }
                    />
                </div>
                <div className="flex justify-end">
                    <TooltipIconButton
                        icon={Download}
                        label="Download document"
                        disabled={!canPreview}
                        onClick={() =>
                            row.download_url &&
                            window.open(row.download_url, '_blank', 'noopener')
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                <FileText size={18} className="text-neutral-500" />
                <div>
                    <h1 className="text-xl font-semibold text-ink">
                        Documents
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Every trainee document, across every trainee, in one place.
                    </p>
                </div>
            </div>
            <DataTableCardField<DocumentRow>
                apiUrl="/documents"
                apiQueryKey="documents"
                columns={columns}
                enableCreate={false}
                enableEdit={false}
                defaultSortBy="created_at"
                defaultSortDir="desc"
                listHeader={listHeader}
                renderCard={renderRow}
                data-cy="documents-index-data-table-field"
            />
            <AttachmentViewerModal
                attachment={previewing}
                onClose={() => setPreviewing(null)}
            />
        </>
    );
}
