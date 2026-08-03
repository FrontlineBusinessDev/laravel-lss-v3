/**
 * Formats a number or numeric string to two decimal places.
 * Returns '0.00' if the input is invalid, NaN, or non-finite.
 *
 * @param num - The input value to format (e.g., `12.3`, `"45.678"`, or `NaN`).
 * @returns The formatted number string with exactly two decimal places (e.g., `"12.30"`).
 *
 * @example
 * formatToTwoDecimals(12.3)     // Returns "12.30"
 * formatToTwoDecimals("45.678") // Returns "45.68"
 * formatToTwoDecimals("abc")    // Returns "0.00"
 */
export function formatToTwoDecimals(num: string | number): string {
    const parsed = typeof num === 'string' ? parseFloat(num) : num;

    if (isNaN(parsed) || !isFinite(parsed)) {
        return '0.00';
    }

    return parsed.toFixed(2);
}
