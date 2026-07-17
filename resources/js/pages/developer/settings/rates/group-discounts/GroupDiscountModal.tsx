import { groupDiscountService } from '@/api-service-layer/admin/rates';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { GroupDiscount } from '@/types/modules/settings/academic/group-discount';
import { fields } from '@/types/modules/settings/academic/group-discount';

interface Props {
    open: boolean;
    onClose: () => void;
    row: GroupDiscount | null;
}

export default function GroupDiscountModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<GroupDiscount>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Group Discount' : 'Add Group Discount'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update' : 'Create'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? groupDiscountService.update(
                          row.id,
                          payload as Partial<GroupDiscount>,
                      )
                    : groupDiscountService.create(
                          payload as Partial<GroupDiscount>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-rates/group-discounts',
            )}
            onSuccess={() =>
                toast({
                    title: isEdit
                        ? 'Group discount updated'
                        : 'Group discount created',
                    variant: 'success',
                })
            }
        />
    );
}
