import { Button } from '@/components/Button';
import { RowMenu, RowMenuAction } from '@/components/RowMenu';
import { ColumnDef } from '@/components/table';
import DataTableCardField from '@/components/table/DataTableCardField';
import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { cn } from '@/lib/utils';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import {
    Archive,
    ArchiveRestore,
    Eye,
    Lock,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { renderCitation } from '../certificateUtils';
import { CertificateTemplateBuilder } from '../citations/CertificateTemplateBuilder';
import type {
    CertificateCitation,
    CertificateTemplate,
    CertificateType,
} from '../types';

interface CertificateTemplateListProps {
    certificateType: CertificateType;
}

const APPLIES_TO_LABEL: Record<string, string> = {
    trainee: 'Trainee',
    seminar: 'Seminar',
    both: 'Both',
};

const columns: ColumnDef<CertificateCitation>[] = [
    { key: 'title', label: 'Title', searchable: true },
    {
        key: 'applies_to',
        label: 'Applies to',
        filterable: true,
        type: 'select',
        exactFilters: true,
        typeData: [
            { value: '', label: 'All types' },
            { value: 'trainee', label: 'Trainee' },
            { value: 'seminar', label: 'Seminar' },
            { value: 'both', label: 'Both' },
        ],
    },
    {
        key: 'status',
        label: 'Status',
        filterable: true,
        type: 'select',
        exactFilters: true,
        typeData: STATUS_FILTER_PAIRS,
    },
];

export default function index({
    certificateType,
}: CertificateTemplateListProps) {
    const [editing, setEditing] = useState<CertificateCitation | null | 'new'>(
        null,
    );
    const [previewing, setPreviewing] = useState<CertificateCitation | null>(
        null,
    );
    const [refreshTable, setRefreshTable] = useState<() => void>(
        () => () => {},
    );

    function renderRow(
        row: CertificateCitation,
        actions: {
            onArchive: () => void;
            onRestore: () => void;
            onDelete: () => void;
        },
    ) {
        const menu: RowMenuAction[] = [
            row.status === 'inactive'
                ? {
                      label: 'Restore',
                      icon: ArchiveRestore,
                      onClick: actions.onRestore,
                  }
                : {
                      label: 'Archive',
                      icon: Archive,
                      onClick: actions.onArchive,
                  },
            {
                label: row.critical ? 'Delete (protected)' : 'Delete',
                icon: row.critical ? Lock : Trash2,
                danger: !row.critical,
                disabled: !!row.critical,
                onClick: actions.onDelete,
            },
        ];

        return (
            <div
                className="flex flex-col gap-2 px-4 py-3 text-sm sm:grid sm:grid-cols-[2fr_1fr_1fr_2.5rem] sm:items-center sm:gap-3"
                data-cy="citations-index-row"
            >
                <div className="min-w-0" data-cy="citations-index-div-title">
                    <div className="flex items-center gap-1.5 truncate font-medium text-ink">
                        {row.title}
                        {row.critical && (
                            <Lock
                                size={11}
                                className="shrink-0 text-warning-600"
                            />
                        )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                        {row.body_text}
                    </p>
                </div>
                <span className="text-neutral-600">
                    {APPLIES_TO_LABEL[row.applies_to]}
                </span>
                <span>
                    <span
                        className={cn(
                            'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                            row.status === 'active'
                                ? 'bg-success-50 text-success-800'
                                : 'bg-neutral-100 text-neutral-500',
                        )}
                    >
                        {row.status === 'active' ? 'Active' : 'Archived'}
                    </span>
                </span>
                <div className="flex justify-end gap-0.5">
                    <button
                        onClick={() => setPreviewing(row)}
                        className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        aria-label="Preview citation"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        onClick={() => setEditing(row)}
                        className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        aria-label="Edit citation"
                    >
                        <Pencil size={14} />
                    </button>
                    <RowMenu actions={menu} />
                </div>
            </div>
        );
    }

    const previewText = previewing
        ? renderCitation(previewing.body_text, {
              name: 'Juan Dela Cruz',
              school: 'Sample School',
              hours: 486,
              seminarTopic: 'Sample Seminar Topic',
          })
        : '';

    return (
        <>
            <CertificatesPrimaryLayout
                data-cy="citations-index-layout"
                actionNode={
                    <Button
                        variant="primary"
                        onClick={() => setEditing('new')}
                        icon={Plus}
                        data-cy="citations-index-button-add"
                    >
                        New template
                    </Button>
                }
            >
                <div data-cy="certificate-template-list-div">
                    <DataTableCardField<CertificateTemplate>
                        apiUrl="/certificates/templates"
                        apiQueryKey={[
                            'certificates-templates',
                            certificateType,
                        ]}
                        columns={columns}
                        defaultSortBy="name"
                        extraFilters={{ certificate_type: certificateType }}
                        archiveUrl={(row) =>
                            `/certificates/templates/${row.id}/archive`
                        }
                        restoreUrl={(row) =>
                            `/certificates/templates/${row.id}/restore`
                        }
                        renderCard={(row, actions) => renderRow(row, actions)}
                        onRefreshRef={(fn) => setRefreshTable(() => fn)}
                    />

                    <CertificateTemplateBuilder
                        open={!!editing}
                        certificateType={certificateType}
                        initial={editing === 'new' ? null : editing}
                        onClose={() => setEditing(null)}
                        onSaved={() => refreshTable()}
                    />
                </div>
            </CertificatesPrimaryLayout>
        </>
    );
}
