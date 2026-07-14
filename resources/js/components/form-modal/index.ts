/**
 * @file components/form-modal/index.ts
 * Public entry point for the reusable form-modal system.
 */

export { FormModal } from './FormModal';
export { FormModalBody } from './FormModalBody';
export { buildYupSchema } from './build-yup-schema';
export {
    buildInitialValues,
    buildPayload,
    mapApiErrorsToFormik,
} from './form-values';
export type {
    FormModalConfig,
    FormModalLayout,
    FormModalProps,
} from './types';
