import { paymentMethodService } from '@/api-service-layer/admin/payment-method';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import type { PaymentMethod } from '@/types/modules/settings/payment-methods';
import { fields } from '@/types/modules/settings/payment-methods';

interface Props {
    open: boolean;
    onClose: () => void;
    row: PaymentMethod | null;
}

export default function PaymentMethodModal({ open, onClose, row }: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<PaymentMethod>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Payment Method' : 'Add Payment Method'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update Method' : 'Create Method'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? paymentMethodService.update(
                          row.id,
                          payload as Partial<PaymentMethod>,
                      )
                    : paymentMethodService.create(
                          payload as Partial<PaymentMethod>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-payment-methods',
            )}
            onSuccess={() =>
                showToast(
                    isEdit ? 'Payment method updated' : 'Payment method created',
                    'success',
                )
            }
            data-cy="modal-payment-settings"
            submitButtonDataCy="btn-save-settings"
        />
    );
}
