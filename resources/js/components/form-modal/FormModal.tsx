/**
 * @file components/form-modal/FormModal.tsx
 * Reusable, config-driven form modal:
 *   - Layout switch → ModalCenter (centered) or ModalSide (drawer)
 *   - State        → Formik
 *   - Validation   → Yup (derived from fields, or an explicit schema)
 *   - Data sync    → TanStack Query useMutation (invalidates on success)
 *   - Fields       → looped FieldDef[] rendered via <DynamicField>
 *
 * Modules pass a `fields` array (typed against FieldDef) and a `mutationFn`;
 * everything else — seeding, validation, submit, error mapping — is handled here.
 */

import { ModalCenter } from '@/components/modal/ModalCenter';
import { ModalSide } from '@/components/modal/ModalSide';
import { isFieldVisible } from '@/components/table/utils';
import { ApiError } from '@/lib/apiFetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useMemo } from 'react';
import { buildYupSchema } from './build-yup-schema';
import {
    buildInitialValues,
    buildPayload,
    mapApiErrorsToFormik,
} from './form-values';
import { FormModalBody } from './FormModalBody';
import type { FormModalConfig, FormModalProps } from './types';

type Values = Record<string, unknown>;

export function FormModal<T extends object = Record<string, unknown>>({
    open,
    onClose,
    title,
    subtitle,
    layout = 'center',
    size = 'md',
    side = 'right',
    width = 540,
    fields,
    mode = 'create',
    row,
    initialValues,
    validationSchema,
    mutationFn,
    invalidateKeys,
    onSuccess,
    submitLabel,
    cancelLabel = 'Cancel',
    closeOnEscape = true,
    closeOnOverlayClick = true,
    uploadProgress = null,
}: FormModalProps<T>) {
    const queryClient = useQueryClient();
    const visibleFields = useMemo(
        () => fields.filter((f) => isFieldVisible(f, mode, row)),
        [fields, mode, row],
    );
    const seededValues = useMemo(
        () => initialValues ?? buildInitialValues(visibleFields, mode, row),
        [initialValues, visibleFields, mode, row],
    );
    const schema = useMemo(
        () => validationSchema ?? buildYupSchema(visibleFields),
        [validationSchema, visibleFields],
    );
    const mutation = useMutation<T, Error, Values>({
        mutationFn,
        onSuccess: (saved) => {
            invalidateKeys?.forEach((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
            );
            onSuccess?.(saved);
        },
    });

    // Mounting only while open resets Formik state on every reopen.
    if (!open) {
        return null;
    }

    // The body reads config generically (fields flow into <DynamicField>), so a
    // single base-typed config keeps the modal shells' generics simple.
    const config = {
        fields,
        mode,
        row,
        submitLabel:
            submitLabel ?? (mode === 'create' ? 'Create' : 'Save changes'),
        cancelLabel,
        uploadProgress,
        mutation,
    } as unknown as FormModalConfig;

    const handleClose = () => {
        if (mutation.isPending) return;
        onClose();
    };

    return (
        <>
            <Formik<Values>
                initialValues={seededValues}
                validationSchema={schema as any}
                enableReinitialize={false}
                onSubmit={async (values, helpers) => {
                    helpers.setStatus(undefined);
                    try {
                        await mutation.mutateAsync(
                            buildPayload(visibleFields, values),
                        );
                        onClose();
                    } catch (err) {
                        if (err instanceof ApiError && err.errors) {
                            helpers.setErrors(mapApiErrorsToFormik(err.errors));
                        }
                        helpers.setStatus(
                            err instanceof Error
                                ? err.message
                                : 'Failed to save record.',
                        );
                    } finally {
                        helpers.setSubmitting(false);
                    }
                }}
            >
                {layout === 'side' ? (
                    <ModalSide<FormModalConfig>
                        show={open}
                        onClose={handleClose}
                        data={config}
                        side={side}
                        width={width}
                        title={title}
                        subtitle={subtitle}
                        ModalComponent={FormModalBody}
                        closeOnEscape={closeOnEscape}
                        closeOnOverlayClick={closeOnOverlayClick}
                    />
                ) : (
                    <ModalCenter<FormModalConfig>
                        show={open}
                        onClose={handleClose}
                        data={config}
                        size={size}
                        title={title}
                        ModalComponent={FormModalBody}
                        closeOnEscape={closeOnEscape}
                        closeOnOverlayClick={closeOnOverlayClick}
                    />
                )}
            </Formik>
        </>
    );
}

export default FormModal;
