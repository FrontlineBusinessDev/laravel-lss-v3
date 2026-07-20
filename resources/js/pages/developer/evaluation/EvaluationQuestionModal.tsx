import {
    evaluationSeminarQuestionsService,
    evaluationTrainerQuestionsService,
} from '@/api-service-layer/admin/evaluation';
import type { EvaluationQuestionInput } from '@/api-service-layer/admin/evaluation';
import { FormModal } from '@/components/form-modal';
import type { FieldDef } from '@/components/table';
import { tableListInvalidateKeys } from '@/components/table/utils';
import { useToast } from '@/components/Toast';
import type {
    EvaluationSeminarQuestion,
    EvaluationTrainerQuestion,
} from '@/types/modules/evaluation/evaluation';

export const TYPE_LABEL = {
    rating: 'Rated 1–5',
    text: 'Written response',
} as const;

interface Props {
    category: 'Trainer' | 'Seminar';
    open: boolean;
    onClose: () => void;
    row: EvaluationTrainerQuestion | EvaluationSeminarQuestion | null;
}

export default function EvaluationQuestionModal({
    category,
    open,
    onClose,
    row,
}: Props) {
    const { showToast } = useToast();
    const isEdit = row !== null;
    const service =
        category === 'Trainer'
            ? evaluationTrainerQuestionsService
            : evaluationSeminarQuestionsService;
    const queryKey =
        category === 'Trainer'
            ? 'evaluation-trainer-questionnaire'
            : 'evaluation-seminar-questionnaire';

    const fields: FieldDef<EvaluationTrainerQuestion>[] = [
        {
            key: 'section',
            label: 'Section',
            type: 'text',
            required: true,
            placeholder: 'e.g. Communication & Delivery',
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
                category === 'Trainer'
                    ? 'e.g. The trainer explained tasks clearly and was available for guidance.'
                    : 'e.g. The resource speaker was knowledgeable and engaging.',
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
        <FormModal<EvaluationTrainerQuestion>
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit question' : 'Add question'}
            mode={isEdit ? 'edit' : 'create'}
            row={(row as EvaluationTrainerQuestion) ?? undefined}
            fields={fields}
            submitLabel={isEdit ? 'Save changes' : 'Create'}
            mutationFn={(payload) =>
                (isEdit && row
                    ? service.update(row.id, payload as EvaluationQuestionInput)
                    : service.create(
                          payload as EvaluationQuestionInput,
                      )) as Promise<EvaluationTrainerQuestion>
            }
            invalidateKeys={tableListInvalidateKeys(queryKey)}
            onSuccess={() =>
                showToast(
                    isEdit ? 'Question updated.' : 'Question added.',
                    'success',
                )
            }
        />
    );
}
