import { useMemo, useState } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Archive,
    ArchiveRestore,
    Trash2,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { RowMenu } from '@/components/RowMenu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AddSchoolModal, type SchoolFormValues } from './AddSchoolModal';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/context/BatchesContext';
import { partnerSchools as initialSchools } from '@/data/mockData';
import type { PartnerSchool } from '@/types';
import { cn } from '@/lib/utils';

const SWATCHES = [
    'bg-brand-50 text-brand-700',
    'bg-success-50 text-success-800',
    'bg-warning-50 text-warning-800',
    'bg-neutral-100 text-neutral-500',
];

type PendingAction = {
    type: 'archive' | 'restore' | 'delete';
    school: PartnerSchool;
} | null;

export function PartnerSchoolsTab() {
    const { showToast } = useToast();
    const { trainees } = useBatches();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PartnerSchool | null>(null);
    const [schools, setSchools] = useState<PartnerSchool[]>(initialSchools);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All statuses');
    const [pending, setPending] = useState<PendingAction>(null);

    /** Real trainee count per school, derived live — replaces the stored `trainees` counter, which
     *  had drifted out of sync with actual records (e.g. showing 38 for a school with 2 real trainees). */
    const traineeCountBySchool = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of trainees) {
            if (t.archived) continue;
            counts.set(t.school, (counts.get(t.school) ?? 0) + 1);
        }
        return counts;
    }, [trainees]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return schools.filter((s) => {
            const matchesQuery =
                !q ||
                s.name.toLowerCase().includes(q) ||
                s.abbr.toLowerCase().includes(q) ||
                s.contactPerson.toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'All statuses' ||
                s.status === statusFilter.toLowerCase();
            return matchesQuery && matchesStatus;
        });
    }, [schools, query, statusFilter]);

    function openAdd() {
        setEditing(null);
        setModalOpen(true);
    }
    function openEdit(s: PartnerSchool) {
        setEditing(s);
        setModalOpen(true);
    }

    function handleSave(values: SchoolFormValues) {
        if (editing) {
            setSchools((prev) =>
                prev.map((s) =>
                    s.id === editing.id ? { ...s, ...values } : s,
                ),
            );
            showToast(`${values.name} was updated.`, 'success');
        } else {
            const newSchool: PartnerSchool = {
                id: `s${Date.now()}`,
                trainees: 0,
                status: 'active',
                ...values,
            };
            setSchools((prev) => [newSchool, ...prev]);
            showToast(`${values.name} was added.`, 'success');
        }
        setModalOpen(false);
        setEditing(null);
    }

    function runConfirmed() {
        if (!pending) return;
        const { type, school } = pending;
        if (type === 'archive') {
            setSchools((prev) =>
                prev.map((s) =>
                    s.id === school.id ? { ...s, status: 'archived' } : s,
                ),
            );
            showToast(`${school.name} was archived.`, 'success');
        } else if (type === 'restore') {
            setSchools((prev) =>
                prev.map((s) =>
                    s.id === school.id ? { ...s, status: 'active' } : s,
                ),
            );
            showToast(`${school.name} was restored.`, 'success');
        } else if (type === 'delete') {
            setSchools((prev) => prev.filter((s) => s.id !== school.id));
            showToast(`${school.name} was deleted.`, 'error');
        }
        setPending(null);
    }

    return (
        <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-neutral-500">
                    {filtered.length} of {schools.length} partner schools
                </span>
                <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    className="w-full sm:w-auto"
                    onClick={openAdd}
                >
                    Add school
                </Button>
            </div>

            <div className="mb-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full flex-1 sm:min-w-40">
                    <Search
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by school name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-9 w-full rounded-md border border-neutral-200 pr-2.5 pl-8 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                    />
                </div>
                <div className="w-full sm:w-40">
                    <Dropdown
                        options={['All statuses', 'Active', 'Archived']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
                <div className="lss-scrollbar overflow-x-auto">
                    <table className="w-full min-w-160 border-collapse text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                                <th className="px-4 py-2.5 font-medium">
                                    School
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Contact person
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Email
                                </th>
                                <th className="px-4 py-2.5 font-medium">
                                    Trainees
                                </th>
                                <th className="px-4 py-2.5" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <tr
                                    key={s.id}
                                    className={cn(
                                        'border-t border-neutral-100 transition-colors hover:bg-neutral-50',
                                        s.status === 'archived' &&
                                            'text-neutral-400',
                                    )}
                                >
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-semibold',
                                                    SWATCHES[
                                                        i % SWATCHES.length
                                                    ],
                                                )}
                                            >
                                                {s.logoUrl ? (
                                                    <img
                                                        src={s.logoUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    s.abbr
                                                )}
                                            </div>
                                            <span
                                                className={cn(
                                                    'font-medium',
                                                    s.status === 'archived'
                                                        ? 'text-neutral-400'
                                                        : 'text-ink',
                                                )}
                                            >
                                                {s.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-neutral-600">
                                        {s.contactPerson}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-neutral-500">
                                        {s.email}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-ink">
                                        {traineeCountBySchool.get(s.name) ?? 0}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <RowMenu
                                            actions={[
                                                {
                                                    label: 'Edit school',
                                                    icon: Pencil,
                                                    onClick: () => openEdit(s),
                                                },
                                                s.status === 'archived'
                                                    ? {
                                                          label: 'Restore',
                                                          icon: ArchiveRestore,
                                                          onClick: () =>
                                                              setPending({
                                                                  type: 'restore',
                                                                  school: s,
                                                              }),
                                                      }
                                                    : {
                                                          label: 'Archive',
                                                          icon: Archive,
                                                          onClick: () =>
                                                              setPending({
                                                                  type: 'archive',
                                                                  school: s,
                                                              }),
                                                      },
                                                {
                                                    label: 'Delete',
                                                    icon: Trash2,
                                                    danger: true,
                                                    onClick: () =>
                                                        setPending({
                                                            type: 'delete',
                                                            school: s,
                                                        }),
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-sm text-neutral-400"
                                    >
                                        <Building2
                                            size={20}
                                            className="mx-auto mb-2 text-neutral-300"
                                        />
                                        No partner schools match your search or
                                        filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 sm:hidden">
                {filtered.map((s, i) => (
                    <div
                        key={s.id}
                        className={cn(
                            'rounded-lg border border-neutral-200 bg-white p-3.5',
                            s.status === 'archived' && 'opacity-60',
                        )}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <button
                                onClick={() => openEdit(s)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-semibold',
                                        SWATCHES[i % SWATCHES.length],
                                    )}
                                >
                                    {s.logoUrl ? (
                                        <img
                                            src={s.logoUrl}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        s.abbr
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-ink">
                                        {s.name}
                                    </p>
                                    <p className="truncate text-xs text-neutral-500">
                                        {s.contactPerson}
                                    </p>
                                </div>
                            </button>
                            <RowMenu
                                actions={[
                                    {
                                        label: 'Edit school',
                                        icon: Pencil,
                                        onClick: () => openEdit(s),
                                    },
                                    s.status === 'archived'
                                        ? {
                                              label: 'Restore',
                                              icon: ArchiveRestore,
                                              onClick: () =>
                                                  setPending({
                                                      type: 'restore',
                                                      school: s,
                                                  }),
                                          }
                                        : {
                                              label: 'Archive',
                                              icon: Archive,
                                              onClick: () =>
                                                  setPending({
                                                      type: 'archive',
                                                      school: s,
                                                  }),
                                          },
                                    {
                                        label: 'Delete',
                                        icon: Trash2,
                                        danger: true,
                                        onClick: () =>
                                            setPending({
                                                type: 'delete',
                                                school: s,
                                            }),
                                    },
                                ]}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                            <span className="truncate">{s.email}</span>
                            <span className="shrink-0 font-medium text-ink">
                                {traineeCountBySchool.get(s.name) ?? 0} trainees
                            </span>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
                        <Building2
                            size={20}
                            className="mx-auto mb-2 text-neutral-300"
                        />
                        No partner schools match your search or filters.
                    </div>
                )}
            </div>

            <AddSchoolModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initial={editing}
            />

            {pending && (
                <ConfirmDialog
                    open={!!pending}
                    onClose={() => setPending(null)}
                    onConfirm={runConfirmed}
                    title={
                        pending.type === 'archive'
                            ? 'Archive school'
                            : pending.type === 'restore'
                              ? 'Restore school'
                              : 'Delete school'
                    }
                    tone={pending.type === 'delete' ? 'danger' : 'default'}
                    confirmLabel={
                        pending.type === 'archive'
                            ? 'Archive'
                            : pending.type === 'restore'
                              ? 'Restore'
                              : 'Delete permanently'
                    }
                    confirmDisabled={
                        pending.type === 'delete' &&
                        (traineeCountBySchool.get(pending.school.name) ?? 0) > 0
                    }
                    description={
                        pending.type === 'archive'
                            ? `${pending.school.name} will be moved to archived records. You can restore it later.`
                            : pending.type === 'restore'
                              ? `${pending.school.name} will be restored to active records.`
                              : (traineeCountBySchool.get(
                                      pending.school.name,
                                  ) ?? 0) > 0
                                ? `${pending.school.name} has ${traineeCountBySchool.get(pending.school.name)} trainee${(traineeCountBySchool.get(pending.school.name) ?? 0) === 1 ? '' : 's'} linked to it and can\u2019t be permanently deleted. Archive it instead to keep it out of active lists.`
                                : `This permanently deletes ${pending.school.name} and cannot be undone.`
                    }
                />
            )}
        </div>
    );
}
