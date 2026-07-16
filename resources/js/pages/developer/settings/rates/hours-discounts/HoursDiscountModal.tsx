import { hoursDiscountService } from '@/api-service-layer/admin/rates';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { HoursDiscount } from '@/types/modules/settings/academic/hours-discount';
import { fields } from '@/types/modules/settings/academic/hours-discount';

interface Props {
    open: boolean;
    onClose: () => void;
    row: HoursDiscount | null;
}

export default function HoursDiscountModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<HoursDiscount>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Hours Discount' : 'Add Hours Discount'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update' : 'Create'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? hoursDiscountService.update(
                          row.id,
                          payload as Partial<HoursDiscount>,
                      )
                    : hoursDiscountService.create(
                          payload as Partial<HoursDiscount>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-rates/hours-discounts',
            )}
            onSuccess={() =>
                toast({
                    title: isEdit
                        ? 'Hours discount updated'
                        : 'Hours discount created',
                    variant: 'success',
                })
            }
        />
    );
}
