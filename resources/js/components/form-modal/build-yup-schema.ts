/**
 * @file components/form-modal/build-yup-schema.ts
 * Derives a Yup validation schema from a FieldDef[] so modules don't hand-write
 * schemas for simple forms. Honors `required`, maps field types to the right
 * Yup base, and threads any per-field `validate(value, values)` through a test.
 * Callers may still pass an explicit schema to <FormModal> to override this.
 */

import * as Yup from 'yup';
import type { FieldDef, FileFieldValue } from '@/types/reusable/fields';

/** Picks the base Yup type for a field's declared input type. */
function baseFor<T>(field: FieldDef<T>): Yup.Schema {
    switch (field.type) {
        case 'number':
            // Coerce '' → undefined so an empty optional number doesn't NaN.
            return Yup.number().transform((v, orig) =>
                orig === '' || orig === null ? undefined : v,
            );
        case 'url':
            // Mirrors the backend's `url` rule so the two agree.
            return Yup.string().url('Enter a valid URL.');
        case 'checkbox':
            return Yup.boolean();
        case 'file':
            return Yup.mixed();
        default:
            return Yup.string();
    }
}

/** Applies the required rule appropriate to the field type. */
function withRequired<T>(schema: Yup.Schema, field: FieldDef<T>): Yup.Schema {
    if (!field.required) {
        return schema;
    }

    const msg = `${field.label} is required.`;

    if (field.type === 'file') {
        return schema.test('file-required', msg, (value) => {
            const v = value as FileFieldValue | undefined;

            return Boolean(
                (v?.existing?.length ?? 0) + (v?.files?.length ?? 0) > 0,
            );
        });
    }

    if (field.type === 'checkbox') {
        return (schema as Yup.BooleanSchema).oneOf([true], msg);
    }

    return schema.required(msg);
}

/** Wires a field's custom `validate` callback into the schema as a Yup test. */
function withCustom<T>(schema: Yup.Schema, field: FieldDef<T>): Yup.Schema {
    if (!field.validate) {
        return schema;
    }

    return schema.test('custom', '', function (value) {
        const error = field.validate?.(
            value,
            this.parent as Record<string, unknown>,
        );

        return error ? this.createError({ message: error }) : true;
    });
}

/** Builds a Yup object schema for the given fields. */
export function buildYupSchema<T = unknown>(
    fields: FieldDef<T>[],
): Yup.ObjectSchema<Record<string, unknown>> {
    const shape: Record<string, Yup.Schema> = {};

    fields.forEach((field) => {
        shape[field.key] = withCustom(
            withRequired(baseFor(field), field),
            field,
        );
    });

    return Yup.object().shape(shape) as Yup.ObjectSchema<
        Record<string, unknown>
    >;
}
