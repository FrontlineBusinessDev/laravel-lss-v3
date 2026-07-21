import { X } from 'lucide-react';
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown';
export interface ScheduleFilterState {
  schools: string[];
  programs: string[];
  batches: string[];
  industries: string[];
  statuses: string[];
}
export const EMPTY_FILTERS: ScheduleFilterState = {
  schools: [],
  programs: [],
  batches: [],
  industries: [],
  statuses: []
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  terminated: 'Terminated',
  dissolved: 'Dissolved'
};
export function ScheduleFilters({
  filters,
  onChange,
  options
}: {
  filters: ScheduleFilterState;
  onChange: (f: ScheduleFilterState) => void;
  options: {
    schools: string[];
    programs: string[];
    batches: string[];
    industries: string[];
    statuses: string[];
  };
}) {
  const hasActive = filters.schools.length + filters.programs.length + filters.batches.length + filters.industries.length + filters.statuses.length > 0;
  return <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center" data-cy="schedule-filters-div-1">
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap" data-cy="schedule-filters-div-2">
        <MultiSelectDropdown options={options.schools} value={filters.schools} placeholder="School" onChange={v => onChange({
        ...filters,
        schools: v
      })} className="sm:w-40" data-cy="schedule-filter-school" />
        <MultiSelectDropdown options={options.programs} value={filters.programs} placeholder="Academic program" onChange={v => onChange({
        ...filters,
        programs: v
      })} className="sm:w-44" data-cy="schedule-filter-program" />
        <MultiSelectDropdown options={options.batches} value={filters.batches} placeholder="Batch" onChange={v => onChange({
        ...filters,
        batches: v
      })} className="sm:w-36" data-cy="schedule-filter-batch" />
        <MultiSelectDropdown options={options.industries} value={filters.industries} placeholder="Industry" onChange={v => onChange({
        ...filters,
        industries: v
      })} className="sm:w-36" data-cy="schedule-filter-industry" />
        <MultiSelectDropdown options={options.statuses.map(s => STATUS_LABELS[s] ?? s)} value={filters.statuses.map(s => STATUS_LABELS[s] ?? s)} placeholder="Status" onChange={labels => {
        const reverse = Object.fromEntries(Object.entries(STATUS_LABELS).map(([k, v]) => [v, k]));
        onChange({
          ...filters,
          statuses: labels.map(l => reverse[l] ?? l)
        });
      }} className="sm:w-32" data-cy="schedule-filter-status" />
      </div>
      {hasActive && <button onClick={() => onChange(EMPTY_FILTERS)} className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700" data-cy="schedule-filters-button-change">
          <X size={13} data-cy="schedule-filters-x-9" />
          Clear filters
        </button>}
    </div>;
}