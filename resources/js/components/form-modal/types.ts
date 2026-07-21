/**
 * @file components/form-modal/types.ts
 * Shared contracts for the reusable <FormModal> system.
 */

import type { QueryKey } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { FieldDef, ModalMode } from '@/types/reusable/fields';

/** Which modal shell to render the form inside. */
export type FormModalLayout = 'center' | 'side';

/**
 * Config handed to the Formik body via the modal shell's `data` prop. Kept
 * separate from form state (which lives in Formik context) so the body
 * component can stay stable across renders.
 */
export interface FormModalConfig<T extends object = Record<string, unknown>> {
    fields: FieldDef<T>[];
    mode: ModalMode;
    row?: T;
    submitLabel: string;
    cancelLabel: string;
    /** Real upload progress (0–100) while a file is being sent, else null. */
    uploadProgress?: number | null;
    mutation?: T;
    submitButtonDataCy?: string;
    closeButtonDataCy?: string;
}

export interface FormModalProps<T extends object = Record<string, unknown>> {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    /** 'center' → ModalCenter, 'side' → ModalSide. Defaults to 'center'. */
    layout?: FormModalLayout;
    /** ModalCenter size preset. */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** ModalSide placement + width. */
    side?: 'left' | 'right';
    width?: number;

    fields: FieldDef<T>[];
    mode?: ModalMode;
    row?: T;
    /** Explicit initial values; otherwise seeded from fields + row. */
    initialValues?: Record<string, unknown>;
    /** Explicit Yup schema; otherwise derived from fields. */
    validationSchema?: unknown;

    /** The mutation to run on submit. Receives the shaped payload. */
    mutationFn: (payload: Record<string, unknown>) => Promise<T>;
    /** Query keys to invalidate on success (list refresh). */
    invalidateKeys?: QueryKey[];
    onSuccess?: (saved: T) => void;

    submitLabel?: string;
    cancelLabel?: string;
    closeOnEscape?: boolean;
    closeOnOverlayClick?: boolean;
    /** Live upload progress passed through to the footer. */
    uploadProgress?: number | null;
    /** Optional extra content rendered above the footer. */
    children?: ReactNode;
    /** data-cy override for the modal shell's dialog root. */
    'data-cy'?: string;
    /** data-cy override for the submit/cancel footer buttons. */
    submitButtonDataCy?: string;
    closeButtonDataCy?: string;
}
