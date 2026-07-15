import { partnerSchoolService } from '@/api-service-layer/admin/partner-school';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { PartnerSchools } from '@/types/modules/settings/partner-schools';
import { fields } from '@/types/modules/settings/partner-schools';

interface Props {
    open: boolean;
    onClose: () => void;
    row: PartnerSchools | null;
}

export default function PartnerSchoolModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<PartnerSchools>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Partner School' : 'Add Partner School'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update School' : 'Create School'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? partnerSchoolService.update(
                          row.id,
                          payload as Partial<PartnerSchools>,
                      )
                    : partnerSchoolService.create(
                          payload as Partial<PartnerSchools>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-partner-schools',
            )}
            onSuccess={() =>
                toast({
                    title: isEdit
                        ? 'Partner school updated'
                        : 'Partner school created',
                    variant: 'success',
                })
            }
        />
    );
}
