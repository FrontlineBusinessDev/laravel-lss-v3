/**
 * @file lib/clipboard.ts
 * Production-safe clipboard copy.
 *
 * `navigator.clipboard` only exists in a secure context (https or localhost).
 * Behind a reverse proxy (Coolify/Hostinger) the app is frequently served to
 * the browser over a non-secure origin, so the async API is undefined and a
 * naive `writeText` silently no-ops. We fall back to a hidden <textarea> +
 * `document.execCommand('copy')`, which works in any browsing context.
 *
 * Returns whether the copy succeeded so callers can toast accordingly.
 */
export async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);

            return true;
        } catch {
            // Permission/context edge cases — fall through to the legacy path.
        }
    }

    return legacyCopy(text);
}

/** Hidden-textarea + execCommand fallback for non-secure/legacy contexts. */
function legacyCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    // Keep it off-screen so focus/scroll are undisturbed.
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    let ok = false;

    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    } finally {
        document.body.removeChild(textarea);
    }

    return ok;
}
