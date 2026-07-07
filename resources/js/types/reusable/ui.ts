/**
 * @file types/reusable/ui.ts
 * Miscellaneous shared UI contracts.
 */

/** Server-driven one-shot toast delivered via an Inertia flash prop. */
export interface FlashToast {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}
