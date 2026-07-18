import { leaveCategoryService } from '@/api-service-layer/admin/leave-category';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { LeaveCategories } from '@/types/modules/settings/leave-categories';
import { fields } from '@/types/modules/settings/leave-categories';

interface Props {
    open: boolean;
    onClose: () => void;
    row: LeaveCategories | null;
}

export default function LeaveCategoryModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<LeaveCategories>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit leave category' : 'Add leave category'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update category' : 'Create category'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? leaveCategoryService.update(
                          row.id,
                          payload as Partial<LeaveCategories>,
                      )
                    : leaveCategoryService.create(
                          payload as Partial<LeaveCategories>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys('settings-leave-categories')}
            onSuccess={() =>
                toast({
                    title: isEdit
                        ? 'Leave category updated'
                        : 'Leave category created',
                    variant: 'success',
                })
            }
        />
    );
}
