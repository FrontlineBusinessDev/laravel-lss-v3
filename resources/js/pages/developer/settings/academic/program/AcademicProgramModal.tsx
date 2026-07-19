import { academicProgramService } from '@/api-service-layer/admin/academic';
import { FormModal } from '@/components/form-modal';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import type { AcademicProgram } from '@/types/modules/settings/academic/program';
import { fields } from '@/types/modules/settings/academic/program';

interface Props {
    open: boolean;
    onClose: () => void;
    row: AcademicProgram | null;
}

export default function AcademicProgramModal({ open, onClose, row }: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;

    return (
        <FormModal<AcademicProgram>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Program' : 'Add Program'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Update Program' : 'Create Program'}
            cancelLabel="Cancel"
            mutationFn={(payload) =>
                isEdit && row
                    ? academicProgramService.update(
                          row.id,
                          payload as Partial<AcademicProgram>,
                      )
                    : academicProgramService.create(
                          payload as Partial<AcademicProgram>,
                      )
            }
            invalidateKeys={tableListInvalidateKeys(
                'settings-academic/program',
            )}
            onSuccess={() =>
                showToast(isEdit ? 'Program updated' : 'Program created', 'success')
            }
        />
    );
}
