import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { leaveRequestService } from '@/api-service-layer/leave-request';
import { Button } from '@/components/Button';
import { SelectField, TextAreaField, TextField } from '@/components/FormField';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/table/DataTable';
import { tableListInvalidateKeys, formatCell } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import type { StatusKind } from '@/types';
import type { CardActions } from '@/types/reusable/card';
import type { FieldOption } from '@/types/reusable/fields';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { traineeColumns } from '@/types/modules/leave/leave-requests';

const STATUS_BADGE: Record<string, StatusKind> = {
    pending: 'pending',
    approved: 'active',
    declined: 'declined',
};

const columns = traineeColumns.map((col) =>
    col.key === 'status'
        ? {
              ...col,
              render: (value: unknown) => (
                  <StatusBadge
                      status={STATUS_BADGE[value as string] ?? 'pending'}
                  />
              ),
          }
        : col,
);

interface FormValues {
    leave_category_id: string;
    leave_date: string;
    return_date: string;
    reason: string;
}

const emptyValues: FormValues = {
    leave_category_id: '',
    leave_date: '',
    return_date: '',
    reason: '',
};

export default function TraineeLeavePage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [categories, setCategories] = useState<FieldOption[]>([]);
    const [values, setValues] = useState<FormValues>(emptyValues);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadLookupOptions('/settings/leave-categories', '', 'name')
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);

    const renderRow = (row: LeaveRequests, actions: CardActions) => (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                        ? col.render(row[col.key], row)
                        : formatCell(row[col.key])}
                </td>
            ))}
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {row.status === 'pending' && (
                    <button
                        type="button"
                        onClick={() => void actions.onDelete()}
                        title="Withdraw"
                        className="rounded-md p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}
            </td>
        </tr>
    );

    function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
        setValues((v) => ({ ...v, [key]: value }));
    }

    async function handleSubmit() {
        if (!values.leave_category_id || !values.leave_date || !values.return_date || !values.reason.trim()) {
            toast({ title: 'Fill in all fields before submitting.', variant: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            await leaveRequestService.submit(values);
            toast({ title: 'Leave request submitted', variant: 'success' });
            setValues(emptyValues);
            tableListInvalidateKeys('leave-requests-own').forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
        } catch (err) {
            toast({
                title: 'Submission failed',
                description: err instanceof Error ? err.message : undefined,
                variant: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <TraineeLayout title="Leave">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-ink">
                    Submit a leave application
                </h2>
                <SelectField
                    label="Category"
                    options={['Select a category', ...categories.map((c) => c.label)]}
                    value={
                        categories.find((c) => String(c.value) === values.leave_category_id)?.label ??
                        'Select a category'
                    }
                    onChange={(e) => {
                        const match = categories.find((c) => c.label === e.target.value);
                        set('leave_category_id', match ? String(match.value) : '');
                    }}
                />
                <div className="grid grid-cols-2 gap-3">
                    <TextField
                        label="Leave date"
                        type="date"
                        value={values.leave_date}
                        onChange={(e) => set('leave_date', e.target.value)}
                    />
                    <TextField
                        label="Return date"
                        type="date"
                        value={values.return_date}
                        onChange={(e) => set('return_date', e.target.value)}
                    />
                </div>
                <TextAreaField
                    label="Reason"
                    rows={3}
                    value={values.reason}
                    onChange={(e) => set('reason', e.target.value)}
                />
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Submitting…' : 'Submit application'}
                </Button>
            </div>

            <h2 className="mb-3 text-sm font-semibold text-ink">
                Your leave history
            </h2>
            <DataTable<LeaveRequests>
                apiUrl="/leave"
                apiQueryKey="leave-requests-own"
                columns={columns}
                defaultSortBy="leave_date"
                defaultSortDir="desc"
                renderCard={renderRow}
            />
        </TraineeLayout>
    );
}
