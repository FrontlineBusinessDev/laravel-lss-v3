import { Thumbnail } from '@/components/Thumbnail';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';
export interface PartnerSchools extends Record<string, unknown> {
    id: number;
    status: string;
    school_name: string;
    abbreviation: string;
    image: string;
    contact_first_name?: string;
    contact_last_name?: string;
    contact_email: string;
    physical_address: string;
    link?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

// ─── Columns: drives the card body, sort dropdown, and filter bar ───────────
export const columns: ColumnDef<PartnerSchools>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        searchable: true,
        filterable: true,
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'school_name',
        label: 'School Name',
        searchable: true,
        filterable: true,
    },
    {
        key: 'abbreviation',
        label: 'Abbreviation',
        searchable: true,
        filterable: true,
    },
    {
        key: 'image',
        label: 'Logo',
        // image comes back from the API as a plain URL string — render it as a
        // thumbnail (with graceful fallback for empty/broken URLs) instead of
        // the raw path text.
        render: (value) => (
            <Thumbnail
                src={value as string}
                alt="School logo"
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                data-cy="partner-schools-thumbnail-1"
            />
        ),
    },
    {
        key: 'contact_first_name',
        label: 'First name',
        filterable: true,
        searchable: true,
    },
    {
        key: 'contact_last_name',
        label: 'Last name',
        filterable: true,
        searchable: true,
    },
    {
        key: 'contact_email',
        label: 'Email',
        filterable: true,
        searchable: true,
    },
    {
        key: 'physical_address',
        label: 'Address',
        filterable: true,
        searchable: true,
    },
    {
        key: 'created_at',
        label: 'Joined',
    },
];

// ─── Fields: drives the Create / Edit modal form ────────────────────────────
export const fields: FieldDef<PartnerSchools>[] = [
    {
        key: 'image',
        label: 'School Logo',
        type: 'file',
        accept: 'image/*',
        maxSizeMB: 2,
        colSpan: 2,
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
        ],
        defaultValue: 'active',
        colSpan: 2,
    },
    {
        key: 'school_name',
        label: 'School Name',
        type: 'text',
        placeholder: 'SPC School',
        required: true,
        colSpan: 2,
    },
    {
        key: 'abbreviation',
        label: 'Abbreviation',
        type: 'text',
        placeholder: 'SPC',
        required: true,
        colSpan: 2,
    },
    {
        key: 'contact_first_name',
        label: 'First name',
        type: 'text',
        placeholder: 'Jane Doe',
        colSpan: 2,
    },
    {
        key: 'contact_last_name',
        label: 'Last name',
        type: 'text',
        placeholder: 'Jane Doe',
        colSpan: 2,
    },
    {
        key: 'contact_email',
        label: 'Email',
        type: 'email',
        placeholder: 'JaneDoe@gmail.com',
        colSpan: 2,
    },
    {
        key: 'physical_address',
        label: 'Physical Address',
        type: 'textarea',
        placeholder: 'Baloc Road, Brgy. San Ignacio, San Pablo City',
        colSpan: 2,
    },
    {
        key: 'link',
        label: 'Website',
        type: 'url',
        placeholder: 'https://school.edu.ph',
        colSpan: 2,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Short description of the school',
        colSpan: 2,
    },
];
