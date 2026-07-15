import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef, loadLookupOptions } from '@/types/reusable/fields';
export interface AppTrainees extends Record<string, unknown> {
    id: number;
    batch_id: number;
    school_id: number;
    public_url_id: string;
    first_name: string;
    last_name: string;
    email: string;
    birthday: string;
    birth_place: string;
    gender: 'male' | 'female';
    mobile_number: string;
    emergency_contact_name: string;
    emergency_contact_number: string;
    required_hours: number;
    date_completed: string | null;
    address: string;
    created_at: string;
    updated_at: string;
}
export const studentsStatus = ['active', 'inactive', 'ongoing', 'completed'];

export const columns: ColumnDef<AppTrainees>[] = [
    {
        key: 'status',
        label: 'status',
        searchable: true,
        filterable: true,
        type: 'select',
        typeData: studentsStatus,
    },
    {
        key: 'school_id',
        label: 'School Name',
        searchable: true,
        filterable: true,
        type: 'async-select',
        loadOptions: (q) =>
            loadLookupOptions('/settings/partner-schools', q, 'school_name'),
        // Changing the industry filter resets the dependent program filter.
        // filterResets: ['school_id'],
    },
    {
        key: 'academic_industry_id',
        label: 'Industry',
        searchable: true,
        filterable: true,
        type: 'async-select',
        loadOptions: (q) =>
            loadLookupOptions('/settings/academic/industry', q, 'name'),
        // Changing the industry filter resets the dependent program filter.
        // filterResets: ['school_id'],
    },
    {
        key: 'academic_level_id',
        label: 'Level',
        searchable: true,
        filterable: true,
        type: 'async-select',
        loadOptions: (q) =>
            loadLookupOptions('/settings/academic/level', q, 'name'),
        // Changing the industry filter resets the dependent program filter.
        // filterResets: ['school_id'],
    },
    {
        key: 'academic_program_id',
        label: 'Program',
        searchable: true,
        filterable: true,
        type: 'async-select',
        loadOptions: (q) =>
            loadLookupOptions('/settings/academic/program', q, 'name'),
        // Changing the industry filter resets the dependent program filter.
        // filterResets: ['school_id'],
    },
    {
        key: 'first_name',
        label: 'First Name',
        searchable: true,
        filterable: true,
    },
    {
        key: 'last_name',
        label: 'Last Name',
        searchable: true,
        filterable: true,
    },
    {
        key: 'email',
        label: 'Email',
        searchable: true,
        filterable: true,
    },
    // {
    //     key: 'required_hours',
    //     label: 'Required Hours',
    //     searchable: true,
    //     filterable: true,
    // },
    {
        key: 'date_completed',
        label: 'Status',
        render: (value) =>
            value ? (
                <span
                    className="font-medium text-green-600"
                    data-cy="trainees-span-completed"
                >
                    Completed ({value as string})
                </span>
            ) : (
                <span
                    className="font-medium text-amber-500"
                    data-cy="trainees-span-on-going"
                >
                    On-going
                </span>
            ),
    },
];
export const fields: FieldDef<AppTrainees>[] = [
    {
        key: 'batch_id',
        label: 'Assigned Core Batch',
        type: 'select',
        required: true,
    },
    {
        key: 'school_id',
        label: 'Partner School Affiliation',
        type: 'select',
        required: true,
    },
    {
        key: 'public_url_id',
        label: 'Unique Access Token ID',
        type: 'text',
        required: true,
    },
    {
        key: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
    },
    {
        key: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
    },
    {
        key: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
    },
    {
        key: 'birthday',
        label: 'Date of Birth',
        type: 'date',
        required: true,
    },
    {
        key: 'birth_place',
        label: 'Place of Birth',
        type: 'text',
        required: true,
    },
    {
        key: 'gender',
        label: 'Gender Classification',
        type: 'select',
        required: true,
        options: [
            {
                label: 'Male',
                value: 'male',
            },
            {
                label: 'Female',
                value: 'female',
            },
        ],
    },
    {
        key: 'mobile_number',
        label: 'Mobile Contact No.',
        type: 'text',
        required: true,
    },
    {
        key: 'emergency_contact_name',
        label: 'Emergency Guardian Name',
        type: 'text',
        required: true,
    },
    {
        key: 'emergency_contact_number',
        label: 'Emergency Contact No.',
        type: 'text',
        required: true,
    },
    {
        key: 'required_hours',
        label: 'Total Hours Demanded',
        type: 'text',
        // Handles decimal conversions cleanly visually
        required: true,
    },
    {
        key: 'date_completed',
        label: 'Completion Date',
        type: 'date',
    },
    {
        key: 'address',
        label: 'Permanent Complete Address',
        type: 'textarea',
        required: true,
        colSpan: 2,
    },
];
