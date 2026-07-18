import { leaveRequestService } from '@/api-service-layer/leave-request';
import { Button } from '@/components/Button';
import { SelectField, TextAreaField, TextField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import DataTableCardField from '@/components/table/DataTableCardField';
import { formatCell, tableListInvalidateKeys } from '@/components/table/utils';
import { FileUploadField, emptyFileFieldValue } from '@/hooks/use-file-upload-field';
import { useToast } from '@/hooks/use-toast';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import type { StatusKind } from '@/types';
import type { LeaveRequests } from '@/types/modules/leave/leave-requests';
import { traineeColumns } from '@/types/modules/leave/leave-requests';
import type { CardActions } from '@/types/reusable/card';
import type { FieldOption } from '@/types/reusable/fields';
import type { FileFieldValue } from '@/types/reusable/fields';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LeaveDetailsModal } from '@/pages/developer/leave/LeaveDetailsModal';

const REQUIRED_DOCUMENT_HELP_TEXT =
    'For School-Related Leave, uploading a supporting document is required. The supporting document must be signed or approved by the trainee’s school coordinator or authorized school representative.';

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

interface CategoryOption extends FieldOption {
    requiresDocument: boolean;
}

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
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [values, setValues] = useState<FormValues>(emptyValues);
    const [document, setDocument] = useState<FileFieldValue>(
        emptyFileFieldValue,
    );
    const [submitting, setSubmitting] = useState(false);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        leaveRequestService
            .leaveCategories()
            .then((rows) =>
                setCategories(
                    rows.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                        requiresDocument: c.requires_document,
                    })),
                ),
            )
            .catch(() => setCategories([]));
    }, []);

    const selectedCategory = categories.find(
        (c) => c.value === values.leave_category_id,
    );
    const documentRequired = selectedCategory?.requiresDocument ?? false;
    const [detailsTarget, setDetailsTarget] = useState<LeaveRequests | null>(
        null,
    );

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
                <button
                    type="button"
                    onClick={() => setDetailsTarget(row)}
                    title="View details"
                    className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
                >
                    <Eye className="size-4" />
                </button>
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
        if (
            !values.leave_category_id ||
            !values.leave_date ||
            !values.return_date ||
            !values.reason.trim()
        ) {
            toast({
                title: 'Fill in all fields before submitting.',
                variant: 'error',
            });
            return;
        }
        if (documentRequired && document.files.length === 0) {
            toast({
                title: 'A supporting document is required for this leave type.',
                variant: 'error',
            });
            return;
        }
        setSubmitting(true);
        try {
            await leaveRequestService.submit({
                ...values,
                document: document.files[0] ?? null,
            });
            toast({
                title: 'Leave request submitted',
                description: 'Your application is pending admin approval.',
                variant: 'success',
            });
            setValues(emptyValues);
            setDocument(emptyFileFieldValue);
            setFormOpen(false);
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
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">
                    Your leave history
                </h2>
                <Button variant="primary" onClick={() => setFormOpen(true)}>
                    <Plus className="mr-1.5 size-4" />
                    New leave request
                </Button>
            </div>

            <DataTableCardField<LeaveRequests>
                apiUrl="/leave"
                apiQueryKey="leave-requests-own"
                columns={columns}
                defaultSortBy="leave_date"
                defaultSortDir="desc"
                renderCard={renderRow}
            />

            <LeaveDetailsModal
                record={detailsTarget}
                onClose={() => setDetailsTarget(null)}
            />

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title="Submit a leave application"
                maxWidth={560}
            >
                <SelectField
                    label="Category"
                    options={[
                        'Select a category',
                        ...categories.map((c) => c.label),
                    ]}
                    value={
                        categories.find(
                            (c) => String(c.value) === values.leave_category_id,
                        )?.label ?? 'Select a category'
                    }
                    onChange={(e) => {
                        const match = categories.find(
                            (c) => c.label === e.target.value,
                        );
                        set(
                            'leave_category_id',
                            match ? String(match.value) : '',
                        );
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
                <div className="mb-3.5">
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                        Supporting document
                        {documentRequired && (
                            <span className="text-danger-600"> *</span>
                        )}
                    </label>
                    <FileUploadField
                        value={document}
                        onChange={setDocument}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSizeMB={5}
                    />
                    {documentRequired && (
                        <p className="mt-1.5 text-xs text-neutral-500">
                            {REQUIRED_DOCUMENT_HELP_TEXT}
                        </p>
                    )}
                </div>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Submitting…' : 'Submit application'}
                </Button>
            </Modal>
        </TraineeLayout>
    );
}
