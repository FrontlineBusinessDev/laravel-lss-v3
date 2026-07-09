import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';

export interface PartnerSchools extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    abbreviation: string;
    image: string;
    contact: string;
    email: string;
    physical_address: string;
    created_at: string;
    updated_at: string;
}

// ─── Columns: drives the card body, sort dropdown, and filter bar ───────────
export const columns: ColumnDef<PartnerSchools>[] = [
    {
        key: 'name',
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
        // image comes back from the API as a plain URL string —
        // render it as a thumbnail instead of the raw path text.
        render: (value) =>
            value ? (
                <img
                    src={value as string}
                    alt="School logo"
                    className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                />
            ) : (
                <span className="text-sm text-slate-400">—</span>
            ),
    },
    {
        key: 'contact',
        label: 'Contact',
        filterable: true,
        searchable: true,
    },
    {
        key: 'email',
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
    { key: 'created_at', label: 'Joined' },
];

// ─── Fields: drives the Create / Edit modal form ────────────────────────────
export const fields: FieldDef<PartnerSchools>[] = [
    {
        key: 'image',
        label: 'Primary Image',
        type: 'file',
        accept: 'image/*',
        maxSizeMB: 2,
        colSpan: 2,
    },
    {
        key: 'status',
        label: 'Active',
        type: 'checkbox',
        defaultValue: true,
    },
    {
        key: 'name',
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
        key: 'contact',
        label: 'Full name',
        type: 'text',
        required: true,
        placeholder: 'Jane Doe',
        colSpan: 2,
    },
    {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'JaneDoe@gmail.com',
        colSpan: 2,
    },
    {
        key: 'physical_address',
        label: 'Physical Address',
        type: 'textarea',
        required: true,
        placeholder: 'Baloc Road, Brgy. San Ignacio, San Pablo City',
        colSpan: 2,
    },
];
