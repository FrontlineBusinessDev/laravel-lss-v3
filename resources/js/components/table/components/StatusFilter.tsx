/**
 * @file components/StatusFilter.tsx
 * Active / Inactive / All segmented control for list views.
 *
 * Controlled: the parent owns the current value. `'all'` means "no status
 * constraint" — the parent removes the `status` key from its filters so nothing
 * is sent to the API (the default for list/dashboard filtering).
 */

export type StatusScope = 'active' | 'inactive' | 'all';

export interface StatusFilterTab {
    value: string;
    label: string;
}

const DEFAULT_TABS: StatusFilterTab[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

interface StatusFilterProps {
    value: string;
    onChange: (value: string) => void;
    /** Override the segments. Defaults to Active / Inactive / All. */
    tabs?: StatusFilterTab[];
}

export function StatusFilter({
    value,
    onChange,
    tabs = DEFAULT_TABS,
}: StatusFilterProps) {
    return (
        <div className="inline-flex items-center rounded-xl border border-slate-200 p-0.5">
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    type="button"
                    onClick={() => onChange(tab.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        value === tab.value
                            ? 'bg-primary text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
