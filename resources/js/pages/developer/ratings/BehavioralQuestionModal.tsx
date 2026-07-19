import { behavioralQuestionsService } from '@/api-service-layer/admin/behavioral-ratings';
import type { BehavioralQuestionInput } from '@/api-service-layer/admin/behavioral-ratings';
import { FormModal } from '@/components/form-modal';
import type { FieldDef } from '@/components/table';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import type { BehavioralQuestion } from '@/types/modules/ratings/behavioral';
import { SECTIONS, TYPE_LABEL } from './BehavioralAssessmentSetup';

interface Props {
    open: boolean;
    onClose: () => void;
    row: BehavioralQuestion | null;
}

export default function BehavioralQuestionModal({
    open,
    onClose,
    row,
}: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;

    const fields: FieldDef<BehavioralQuestion>[] = [
        {
            key: 'section',
            label: 'Section',
            type: 'select',
            required: true,
            options: SECTIONS.map((s) => ({ value: s, label: s })),
        },
        {
            key: 'type',
            label: 'Response type',
            type: 'select',
            required: true,
            options: [
                { value: 'rating', label: TYPE_LABEL.rating },
                { value: 'text', label: TYPE_LABEL.text },
            ],
        },
        {
            key: 'question',
            label: 'Question',
            type: 'textarea',
            required: true,
            placeholder:
                'e.g. The trainee follows workplace policies, procedures, and instructions.',
        },
        {
            key: 'is_critical',
            label: 'Critical question (can never be permanently deleted)',
            type: 'checkbox',
        },
        {
            key: 'order',
            label: 'Order',
            type: 'number',
            showOnEdit: true,
            showOnCreate: false,
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            showOnEdit: true,
            showOnCreate: false,
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Archived' },
            ],
        },
    ];

    return (
        <FormModal<BehavioralQuestion>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit question' : 'Add question'}
            mode={isEdit ? 'edit' : 'create'}
            row={row ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Save changes' : 'Create'}
            mutationFn={(payload) =>
                (isEdit && row
                    ? behavioralQuestionsService.update(
                          row.id,
                          payload as BehavioralQuestionInput,
                      )
                    : behavioralQuestionsService.create(
                          payload as BehavioralQuestionInput,
                      )) as Promise<BehavioralQuestion>
            }
            invalidateKeys={tableListInvalidateKeys('behavioral-questions')}
            onSuccess={() =>
                showToast(
                    isEdit ? 'Question updated.' : 'Question added.',
                    'success',
                )
            }
        />
    );
}
