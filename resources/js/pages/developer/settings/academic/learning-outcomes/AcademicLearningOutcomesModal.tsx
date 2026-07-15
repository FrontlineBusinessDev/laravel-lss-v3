import { academicLearningOutcomesService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/hooks/use-toast';
import type { AcademicLearningOutcomes } from '@/types/modules/settings/academic/learning-outcomes';
import { fields } from '@/types/modules/settings/academic/learning-outcomes';

interface Props {
    open: boolean;
    onClose: () => void;
    row: AcademicLearningOutcomes | null;
}

export default function AcademicLearningOutcomesModal({
    open,
    onClose,
    row,
}: Props) {
    const { toast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<AcademicLearningOutcomes>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Learning Outcomes' : 'Add Learning Outcomes'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update' : 'Create'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? academicLearningOutcomesService.update(
                          row.id,
                          payload as Partial<AcademicLearningOutcomes>,
                      )
                    : academicLearningOutcomesService.create(
                          payload as Partial<AcademicLearningOutcomes>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-academic/learning-outcomes',
            )}
            onSuccess={() =>
                toast({
                    title: isEdit
                        ? 'Learning outcome updated'
                        : 'Learning outcome created',
                    variant: 'success',
                })
            }
        />
    );
}
