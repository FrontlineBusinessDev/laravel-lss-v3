import { academicProgramTypeService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import { fields } from '@/types/modules/settings/academic/program';
import { AcademicProgramType } from '@/types/modules/settings/academic/program-type';

interface Props {
    open: boolean;
    onClose: () => void;
    row: AcademicProgramType | null;
}

export default function AcademicProgramTypeTypeModal({
    open,
    onClose,
    row,
}: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<AcademicProgramType>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Program Type' : 'Add Program Type'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update Program Type' : 'Create Program Type'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? academicProgramTypeService.update(
                          row.id,
                          payload as Partial<AcademicProgramType>,
                      )
                    : academicProgramTypeService.create(
                          payload as Partial<AcademicProgramType>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-academic/program-type',
            )}
            onSuccess={() =>
                showToast(
                    isEdit ? 'Program Type updated' : 'Program Type created',
                    'success',
                )
            }
        />
    );
}
