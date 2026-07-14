/**
 * @file api-service-layer/form-data.ts
 * Payload-shaping helpers shared by the service layer (and re-usable by
 * use-crud). Mirrors Laravel's expectations: bracketed arrays/objects in query
 * strings, a flat multipart body for file uploads, and the `image.files`
 * single-file unwrap that keeps `$request->file('image')` resolvable.
 */

/** True when a payload contains a File/Blob anywhere in its structure. */
export function hasBinaryFiles(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return Object.values(obj).some((val) => {
        if (val instanceof File || val instanceof Blob) {
            return true;
        }

        if (typeof val === 'object' && val !== null) {
            return hasBinaryFiles(val);
        }

        return false;
    });
}

/** Appends a nested object's entries as bracketed `key[nestedKey]` pairs. */
function appendNestedObject(
    formData: FormData,
    key: string,
    value: Record<string, unknown>,
): void {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue === undefined || nestedValue === null || nestedValue === '') {
            return;
        }

        if (Array.isArray(nestedValue)) {
            nestedValue.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    formData.append(`${key}[${nestedKey}][]`, String(item));
                }
            });

            return;
        }

        formData.append(`${key}[${nestedKey}]`, String(nestedValue));
    });
}

/**
 * Flattens a payload into multipart FormData. Intercepts the `image` file-state
 * wrapper (`{ files: [File] }`) so PHP receives a clean `image` key rather than
 * the mangled `image_files` that never reaches the controller.
 */
export function buildFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (key === 'image' && value && typeof value === 'object' && 'files' in value) {
            const actualFile = (value as { files?: unknown[] }).files?.[0];

            if (actualFile instanceof File || actualFile instanceof Blob) {
                formData.append('image', actualFile);
            }

            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    formData.append(`${key}[]`, item);
                } else if (item !== undefined && item !== null) {
                    formData.append(`${key}[]`, String(item));
                }
            });

            return;
        }

        if (
            typeof value === 'object' &&
            !(value instanceof File) &&
            !(value instanceof Blob) &&
            !(value instanceof Date)
        ) {
            appendNestedObject(formData, key, value as Record<string, unknown>);

            return;
        }

        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);

            return;
        }

        formData.append(key, String(value));
    });

    return formData;
}

/** Appends a plain-object value as bracketed query params (array-aware). */
function appendNestedParam(
    params: URLSearchParams,
    key: string,
    value: Record<string, unknown>,
): void {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue === undefined || nestedValue === null || nestedValue === '') {
            return;
        }

        if (Array.isArray(nestedValue)) {
            nestedValue.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    params.append(`${key}[${nestedKey}][]`, String(item));
                }
            });

            return;
        }

        params.append(`${key}[${nestedKey}]`, String(nestedValue));
    });
}

/**
 * Serializes query params the way Laravel parses them back — plain objects
 * (e.g. `filters`) expand into `filters[status]=active` rather than
 * `[object Object]`. Returns a query string WITHOUT the leading `?`.
 */
export function buildQueryString(params: Record<string, unknown>): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (
            typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.getPrototypeOf(value) === Object.prototype
        ) {
            appendNestedParam(search, key, value as Record<string, unknown>);

            return;
        }

        search.append(key, String(value));
    });

    return search.toString();
}
