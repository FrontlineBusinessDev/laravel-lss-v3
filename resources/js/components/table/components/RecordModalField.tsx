/**
 * @file components/table/components/RecordModalField.tsx
 * The dynamic input renderer for RecordModal. Split out of RecordModal so each
 * file stays focused (and under the line cap), and restyled onto the shared
 * form atoms (Field / inputCls / textareaCls) so the generic record modal looks
 * identical to CreateBatchModal.
 *
 * Supported types: text, number, email, password, date, datetime-local,
 *                  textarea, select, checkbox, async-select, file.
 */

import { Field, inputCls, textareaCls } from '@/components/form/Field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { FileUploadField } from '@/hooks/use-file-upload-field';
import type { FieldDef } from '../types';
import type { FileFieldValue } from '@/types/reusable/fields';
interface DynamicFieldProps<T> {
    field: FieldDef<T>;
    value: unknown;
    error?: string;
    disabled?: boolean;
    /** Preset label for async-select edit mode (resolved from the row). */
    initialLabel?: string;
    onChange: (value: unknown) => void;
}
export function DynamicField<T>({
    field,
    value,
    error,
    disabled,
    initialLabel,
    onChange,
}: DynamicFieldProps<T>) {
    if (field.type === 'file') {
        return (
            <Field
                label={field.label}
                required={field.required}
                helpText={field.helpText}
                error={error}
                data-cy="record-modal-field-field-field-label"
            >
                <FileUploadField
                    value={
                        (value as FileFieldValue) ?? {
                            existing: [],
                            files: [],
                            removedIds: [],
                        }
                    }
                    onChange={onChange}
                    multiple={field.multiple}
                    accept={field.accept}
                    maxSizeMB={field.maxSizeMB}
                    maxFiles={field.maxFiles}
                    preview={field.preview}
                    disabled={disabled}
                    error={error}
                    data-cy="record-modal-field-file-upload-field-change"
                />
            </Field>
        );
    }
    if (field.type === 'async-select') {
        return (
            <Field
                label={field.label}
                required={field.required}
                error={error}
                data-cy="record-modal-field-field-field-label-2"
            >
                <AsyncSelectField
                    value={value}
                    onChange={onChange}
                    loadOptions={field.loadOptions!}
                    getOptionLabel={field.getOptionLabel}
                    initialLabel={initialLabel}
                    placeholder={field.placeholder}
                    debounceMs={field.debounceMs}
                    minSearchLength={field.minSearchLength}
                    disabled={disabled}
                    error={error}
                    data-cy="record-modal-field-async-select-field-field-placeholder"
                />
            </Field>
        );
    }
    if (field.type === 'checkbox') {
        return (
            <div
                data-cy="record-modal-field-div-checkbox-wrapper"
                className="relative"
            >
                <label
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 px-3 py-2.5"
                    data-cy="record-modal-field-label-5"
                >
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-100"
                        data-cy="record-modal-field-input-checkbox"
                    />
                    <span
                        className="text-sm font-medium text-neutral-700"
                        data-cy="record-modal-field-span-7"
                    >
                        {field.label}
                    </span>
                </label>
                {/* {error && (
                    <p
                        className="absolute top-0 mt-1 text-xs text-danger-600"
                        data-cy="record-modal-field-p-checkbox-error"
                    >
                        {error}
                    </p>
                )} */}
            </div>
        );
    }
    return (
        <Field
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            error={error}
            data-cy="record-modal-field-field-field-label-3"
        >
            <FieldControl
                field={field}
                value={value}
                disabled={disabled}
                onChange={onChange}
                data-cy="record-modal-field-field-control-change"
            />
        </Field>
    );
}

/** The bare control for text-like / select / textarea fields (no label wrapper). */
function FieldControl<T>({
    field,
    value,
    disabled,
    onChange,
}: {
    field: FieldDef<T>;
    value: unknown;
    disabled?: boolean;
    onChange: (value: unknown) => void;
}) {
    if (field.type === 'textarea') {
        return (
            <textarea
                rows={3}
                value={(value as string) ?? ''}
                disabled={disabled}
                placeholder={field.placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={textareaCls}
                data-cy="record-modal-field-textarea-field-placeholder"
            />
        );
    }
    if (field.type === 'select') {
        return (
            <select
                value={(value as string | number) ?? ''}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={inputCls}
                data-cy="record-modal-field-select-change"
            >
                <option
                    value=""
                    disabled
                    data-cy="record-modal-field-option-12"
                >
                    {field.placeholder ??
                        `Select ${field.label.toLowerCase()}…`}
                </option>
                {field.options?.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        data-cy="record-modal-field-option-13"
                    >
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    }
    return (
        <input
            type={field.type ?? 'text'}
            value={(value as string | number) ?? ''}
            disabled={disabled}
            placeholder={field.placeholder}
            onChange={(e) =>
                onChange(
                    field.type === 'number'
                        ? e.target.valueAsNumber
                        : e.target.value,
                )
            }
            className={inputCls}
            data-cy="record-modal-field-input-field-placeholder"
        />
    );
}
