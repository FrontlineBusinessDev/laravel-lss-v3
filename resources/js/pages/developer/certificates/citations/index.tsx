import { useState } from 'react';
import { Archive, ArchiveRestore, Eye, Lock, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { RowMenu, type RowMenuAction } from '@/components/RowMenu';
import { Modal } from '@/components/Modal';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { ColumnDef } from '@/types/reusable/data-table';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
import { cn } from '@/lib/utils';
import CertificatesPrimaryLayout from '@/layouts/certificates/CertificatesPrimaryLayout';
import { CertificateSheet } from '../CertificatePrint';
import { renderCitation } from '../certificateUtils';
import { AddEditCitationModal } from '../AddEditCitationModal';
import type { CertificateCitation } from '../types';
import { CertificateTemplateList } from './CertificateTemplateList';

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

const listHeader = (
  <div className="hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500 sm:grid sm:grid-cols-[2fr_1fr_1fr_2.5rem] sm:items-center sm:gap-3">
    <span>Title</span>
    <span>Applies to</span>
    <span>Status</span>
    <span className="text-right">Actions</span>
  </div>
);

export default function CitationsPage() {
  const [editing, setEditing] = useState<CertificateCitation | null | 'new'>(null);
  const [previewing, setPreviewing] = useState<CertificateCitation | null>(null);
  const [refreshTable, setRefreshTable] = useState<() => void>(() => () => {});

  function renderRow(row: CertificateCitation, actions: { onArchive: () => void; onRestore: () => void; onDelete: () => void }) {
    const menu: RowMenuAction[] = [
      row.status === 'inactive'
        ? { label: 'Restore', icon: ArchiveRestore, onClick: actions.onRestore }
        : { label: 'Archive', icon: Archive, onClick: actions.onArchive },
      {
        label: row.critical ? 'Delete (protected)' : 'Delete',
        icon: row.critical ? Lock : Trash2,
        danger: !row.critical,
        disabled: !!row.critical,
        onClick: actions.onDelete,
      },
    ];

    return (
      <div className="flex flex-col gap-2 px-4 py-3 text-sm sm:grid sm:grid-cols-[2fr_1fr_1fr_2.5rem] sm:items-center sm:gap-3" data-cy="citations-index-row">
        <div className="min-w-0" data-cy="citations-index-div-title">
          <div className="flex items-center gap-1.5 truncate font-medium text-ink">
            {row.title}
            {row.critical && <Lock size={11} className="shrink-0 text-warning-600" />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{row.body_text}</p>
        </div>
        <span className="text-neutral-600">{APPLIES_TO_LABEL[row.applies_to]}</span>
        <span>
          <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', row.status === 'active' ? 'bg-success-50 text-success-800' : 'bg-neutral-100 text-neutral-500')}>
            {row.status === 'active' ? 'Active' : 'Archived'}
          </span>
        </span>
        <div className="flex justify-end gap-0.5">
          <button onClick={() => setPreviewing(row)} className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" aria-label="Preview citation">
            <Eye size={14} />
          </button>
          <button onClick={() => setEditing(row)} className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" aria-label="Edit citation">
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
    <CertificatesPrimaryLayout
      data-cy="citations-index-layout"
      actionNode={
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setEditing('new')} data-cy="citations-index-button-add">
          Add citation
        </Button>
      }
    >
      <DataTableCardField<CertificateCitation>
        apiUrl="/certificates/citations"
        apiQueryKey="certificates-citations"
        columns={columns}
        defaultSortBy="title"
        enableStatusFilter
        statusFilterOptions={[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Archived' },
        ]}
        archiveUrl={(row) => `/certificates/citations/${row.id}/archive`}
        restoreUrl={(row) => `/certificates/citations/${row.id}/restore`}
        deleteUrl={(row) => `/certificates/citations/${row.id}`}
        listHeader={listHeader}
        renderCard={(row, actions) => renderRow(row, actions)}
        onRefreshRef={(fn) => setRefreshTable(() => fn)}
      />

      <div className="mt-8" data-cy="citations-index-templates-section">
        <h2 className="mb-1 text-base font-semibold text-ink">Citation certificate templates</h2>
        <p className="mb-3 text-sm text-neutral-500">Design reusable certificate layouts and attach them when issuing certificates.</p>
        <CertificateTemplateList certificateType="citation" />
      </div>

      <AddEditCitationModal
        open={!!editing}
        initial={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => refreshTable()}
      />

      <Modal open={!!previewing} onClose={() => setPreviewing(null)} title="Citation preview" maxWidth={640}>
        {previewing && (
          <div className="flex flex-col gap-4">
            <CertificateSheet
              doc={{
                key: 'preview',
                recipientName: 'Juan Dela Cruz',
                subtitle: previewing.applies_to === 'seminar' ? 'Sample Seminar Topic' : 'Sample School',
                citationText: previewText,
                certificateNo: 'PREVIEW-0000',
                issuedDate: undefined,
              }}
            />
            <div className="flex justify-end">
              <Button variant="secondary" icon={X} onClick={() => setPreviewing(null)}>
                Close preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </CertificatesPrimaryLayout>
  );
}
