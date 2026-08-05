import { useEffect, useState } from 'react';
import { Archive, ArchiveRestore, BadgeCheck, Lock, Pencil } from 'lucide-react';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { ColumnDef } from '@/types/reusable/data-table';
import { apiFetchJson } from '@/lib/apiFetch';
import { useToast } from '@/components/Toast';
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

interface CertificateTemplateListProps {
    /** Registers an imperative "open the New Template flow" trigger with the parent page, which renders the actual button in CertificatesPrimaryLayout's actionNode slot. */
    onRegisterOpenNew?: (fn: () => void) => void;
}

export function CertificateTemplateList({
    onRegisterOpenNew,
}: CertificateTemplateListProps) {
    const { showToast } = useToast();
    const [editing, setEditing] = useState<CertificateTemplate | null>(null);
    const [creatingType, setCreatingType] = useState<CertificateType | null>(
        null,
    );
    const [choosingType, setChoosingType] = useState(false);
    const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
    const [refreshTable, setRefreshTable] = useState<() => void>(
        () => () => {},
    );

    useEffect(() => {
        onRegisterOpenNew?.(() => setChoosingType(true));
    }, [onRegisterOpenNew]);

    async function handleSetDefault(row: CertificateTemplate) {
        setSettingDefaultId(row.id);

        try {
            await apiFetchJson(`/certificates/templates/${row.id}/set-default`, { method: 'PATCH' });
            showToast(`"${row.name}" is now the default ${row.certificate_type} template.`, 'success');
            refreshTable();
        } catch {
            showToast('Failed to set default template.', 'error');
        } finally {
            setSettingDefaultId(null);
        }
    }

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
                : row.is_default
                  ? {
                        label: 'Default template (protected)',
                        icon: Lock,
                        disabled: true,
                        onClick: () => {},
                    }
                  : {
                        label: 'Archive',
                        icon: Archive,
                        onClick: actions.onArchive,
                    },
        ];

        if (row.status === 'active' && !row.is_default) {
            menu.unshift({
                label: settingDefaultId === row.id ? 'Setting default…' : 'Set as default',
                icon: BadgeCheck,
                disabled: settingDefaultId === row.id,
                onClick: () => void handleSetDefault(row),
            });
        }

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
                certificateType={
                    editing?.certificate_type ?? creatingType ?? 'trainee'
                }
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
