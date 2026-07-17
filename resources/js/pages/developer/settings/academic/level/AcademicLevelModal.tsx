import { academicLevelService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { AcademicLevel } from '@/types/modules/settings/academic/level';
import { fields } from '@/types/modules/settings/academic/level';

interface Props {
    open: boolean;
    onClose: () => void;
    row: AcademicLevel | null;
}

export default function AcademicLevelModal({ open, onClose, row }: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<AcademicLevel>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Level' : 'Add Level'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update Level' : 'Create Level'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? academicLevelService.update(
                          row.id,
                          payload as Partial<AcademicLevel>,
                      )
                    : academicLevelService.create(
                          payload as Partial<AcademicLevel>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys('settings-academic/level')}
            onSuccess={() =>
                toast({
                    title: isEdit ? 'Level updated' : 'Level created',
                    variant: 'success',
                })
            }
        />
    );
}
