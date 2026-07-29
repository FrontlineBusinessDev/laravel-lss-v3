import { useState } from 'react';
import { Archive, ArchiveRestore, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/Button';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { ColumnDef } from '@/types/reusable/data-table';
import { cn } from '@/lib/utils';
import type { CertificateTemplate, CertificateType } from '../types';
import { CertificateTemplateBuilder } from './CertificateTemplateBuilder';
import { NewTemplateTypeModal } from './NewTemplateTypeModal';

const TYPE_LABEL: Record<CertificateType, string> = {
    trainee: 'Trainee',
    seminar: 'Seminar',
};

const columns: ColumnDef<CertificateTemplate>[] = [
    { key: 'name', label: 'Name', searchable: true },
    {
        key: 'certificate_type',
        label: 'Type',
        filterable: true,
        type: 'select',
        exactFilters: true,
        typeData: [
            { value: '', label: 'All types' },
            { value: 'trainee', label: 'Trainee' },
            { value: 'seminar', label: 'Seminar' },
        ],
    },
    { key: 'orientation', label: 'Orientation', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
];

export function CertificateTemplateList() {
    const [editing, setEditing] = useState<CertificateTemplate | null>(null);
    const [creatingType, setCreatingType] = useState<CertificateType | null>(null);
    const [choosingType, setChoosingType] = useState(false);
    const [refreshTable, setRefreshTable] = useState<() => void>(
        () => () => {},
    );

    function renderRow(
        row: CertificateTemplate,
        actions: { onArchive: () => void; onRestore: () => void },
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
        ];

        return (
            <div
                className="flex items-center gap-3 px-4 py-2.5 text-sm"
                data-cy="certificate-template-list-row"
            >
                <div className="min-w-0 flex-1 font-medium text-ink">
                    {row.name}
                </div>
                <span className="w-16 shrink-0 rounded-pill bg-brand-50 px-2 py-0.5 text-center text-xs font-medium text-brand-700">
                    {TYPE_LABEL[row.certificate_type]}
                </span>
                <span className="w-24 shrink-0 text-xs text-neutral-500 capitalize">
                    {row.orientation}
                </span>
                <span
                    className={cn(
                        'w-20 shrink-0 rounded-pill px-2 py-0.5 text-center text-xs font-medium',
                        row.status === 'active'
                            ? 'bg-success-50 text-success-800'
                            : 'bg-neutral-100 text-neutral-500',
                    )}
                >
                    {row.status === 'active' ? 'Active' : 'Archived'}
                </span>
                <button
                    onClick={() => setEditing(row)}
                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    aria-label="Edit template"
                >
                    <Pencil size={14} />
                </button>
                <RowMenu actions={menu} />
            </div>
        );
    }

    return (
        <div data-cy="certificate-template-list-div">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="mb-1 text-base font-semibold text-ink">
                        Certificate templates
                    </h2>
                    <p className="text-sm text-neutral-500">
                        Design reusable certificate layouts and attach them when
                        issuing certificates.
                    </p>
                </div>
                <div className="mb-2 flex justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                        onClick={() => setChoosingType(true)}
                    >
                        New template
                    </Button>
                </div>
            </div>
            <DataTableCardField<CertificateTemplate>
                apiUrl="/certificates/templates"
                apiQueryKey="certificates-templates"
                columns={columns}
                defaultSortBy="name"
                archiveUrl={(row) =>
                    `/certificates/templates/${row.id}/archive`
                }
                restoreUrl={(row) =>
                    `/certificates/templates/${row.id}/restore`
                }
                renderCard={(row, actions) => renderRow(row, actions)}
                onRefreshRef={(fn) => setRefreshTable(() => fn)}
            />

            <NewTemplateTypeModal
                open={choosingType}
                onClose={() => setChoosingType(false)}
                onChoose={(type) => {
                    setChoosingType(false);
                    setCreatingType(type);
                }}
            />

            <CertificateTemplateBuilder
                open={!!editing || !!creatingType}
                certificateType={editing?.certificate_type ?? creatingType ?? 'trainee'}
                initial={editing}
                onClose={() => {
                    setEditing(null);
                    setCreatingType(null);
                }}
                onSaved={() => refreshTable()}
            />
        </div>
    );
}
