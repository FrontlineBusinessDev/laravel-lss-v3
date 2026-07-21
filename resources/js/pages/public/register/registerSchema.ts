/**
 * @file pages/public/register/registerSchema.ts
 * Client-side mirror of PublicRegistrationController::storeRules() — gives
 * instant feedback before the request round-trips; the backend remains the
 * source of truth (email uniqueness in particular can only be checked there).
 */

import * as Yup from 'yup';

const ACCEPTED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB, mirrors the backend's max:5120 (KB)

function fileSchema(required: boolean) {
    const schema = Yup.mixed<File>()
        .nullable()
        .test(
            'file-type',
            'Accepted file types: PDF, DOC/DOCX, JPG, PNG.',
            (file) => !file || ACCEPTED_MIME_TYPES.includes(file.type),
        )
        .test(
            'file-size',
            'File must be 5 MB or smaller.',
            (file) => !file || file.size <= MAX_FILE_BYTES,
        );

    return required
        ? schema.required('This document is required.')
        : schema;
}

export const registerSchema = Yup.object({
    first_name: Yup.string().trim().required('First name is required.').max(255),
    last_name: Yup.string().trim().required('Last name is required.').max(255),
    email: Yup.string()
        .trim()
        .email('Enter a valid email address.')
        .required('Email is required.')
        .max(255),
    birthday: Yup.string()
        .required('Date of birth is required.')
        .test(
            'before-today',
            'Date of birth must be in the past.',
            (value) => !!value && new Date(value) < new Date(new Date().toDateString()),
        ),
    birth_place: Yup.string().trim().required('Place of birth is required.').max(255),
    gender: Yup.string()
        .oneOf(['male', 'female'], 'Select a gender.')
        .required('Gender is required.'),
    mobile_number: Yup.string().trim().required('Mobile number is required.').max(50),
    address: Yup.string().trim().required('Complete address is required.').max(1000),
    emergency_contact_name: Yup.string()
        .trim()
        .required('Emergency contact name is required.')
        .max(255),
    emergency_contact_number: Yup.string()
        .trim()
        .required('Emergency contact number is required.')
        .max(50),
    school_id: Yup.string().required('Select a partner school.'),
    required_hours: Yup.number()
        .transform((value, original) => (original === '' ? undefined : value))
        .typeError('Enter a number.')
        .required('Required hours is required.')
        .min(0)
        .max(9999.99),
    resume: fileSchema(true),
    endorsement_letter: fileSchema(false),
    moa: fileSchema(false),
    liability_waiver: fileSchema(false),
});

export type RegisterFormValues = Yup.InferType<typeof registerSchema>;
