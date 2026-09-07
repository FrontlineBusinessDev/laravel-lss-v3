import { formatDateTime } from '@/lib/date';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { ColumnDef } from '@/types/reusable/data-table';

/** One row of the admin/developer master documents list — every trainee document, across every trainee. */
export interface DocumentRow extends Record<string, unknown> {
  id: number;
  status: string;
  trainee_id: number;
  document_type: string;
  original_name: string | null;
  file_name: string | null;
  file_path: string | null;
  mime_type: string | null;
  url_link: string | null;
  file_size: number | null;
  created_at: string;
  trainee_name: string;
  batch_code: string | null;
  view_url: string | null;
  download_url: string | null;
  file_missing: boolean;
}

/** Same free-form document_type values tracked by DocumentsTab.tsx (app_trainees_documents has no DB enum). */
export const DOCUMENT_TYPE_FILTER_PAIRS = [
  { value: '', label: 'All types' },
  { value: 'resume', label: 'Resume' },
  { value: 'endorsement-letter', label: 'Endorsement Letter' },
  { value: 'moa', label: 'MOA' },
  { value: 'liability-waiver', label: 'Liability Waiver' },
  { value: 'scanned-evaluations', label: 'Scanned Evaluations' },
];

const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPE_FILTER_PAIRS.filter((p) => p.value).map((p) => [p.value, p.label]),
);

/** "resume" -> "Resume", falls back to a titleized slug for anything unrecognized. */
export function documentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const columns: ColumnDef<DocumentRow>[] = [
  { key: 'trainee_name', label: 'Trainee', sortable: false },
  { key: 'document_type', label: 'Type', sortable: true },
  { key: 'created_at', label: 'Uploaded', sortable: true, formatType: 'datetime' },
  {
    key: 'document_type',
    label: 'Document type',
    filterable: true,
    sortable: false,
    type: 'select',
    typeData: DOCUMENT_TYPE_FILTER_PAIRS,
  },
  {
    key: 'trainee_id',
    label: 'Trainee',
    filterable: true,
    sortable: false,
    type: 'async-select',
    loadOptions: (q) => loadLookupOptions('/trainees', q, 'first_name'),
  },
];

/** Compact locale-aware timestamp for the Uploaded column. */
export function formatUploadedAt(iso: string): string {
  return formatDateTime(iso);
}

/** Human file size, e.g. "482 KB" / "1.4 MB" — matches DocumentsTab.tsx's formatSize(). */
export function humanFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}
