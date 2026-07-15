import { academicIndustryService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { AcademicIndustry } from '@/types/modules/settings/academic/industry';
import { fields } from '@/types/modules/settings/academic/industry';

interface Props {
    open: boolean;
    onClose: () => void;
    row: AcademicIndustry | null;
}

export default function AcademicIndustryModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<AcademicIndustry>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Industry' : 'Add Industry'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update Industry' : 'Create Industry'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? academicIndustryService.update(
                          row.id,
                          payload as Partial<AcademicIndustry>,
                      )
                    : academicIndustryService.create(
                          payload as Partial<AcademicIndustry>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-academic/industry',
            )}
            onSuccess={() =>
                toast({
                    title: isEdit ? 'Industry updated' : 'Industry created',
                    variant: 'success',
                })
            }
        />
    );
}
