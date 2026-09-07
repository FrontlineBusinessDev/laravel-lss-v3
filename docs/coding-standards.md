# Coding Standards

Maximum file size

300 lines

Maximum function

50 lines

Maximum nesting

3 levels

Prefer early returns.

Avoid switch statements unless necessary.

Prefer composition.

Avoid duplicated code.

Use TypeScript everywhere.

Avoid any.

Prefer readonly.

Prefer named exports.

Never use native `window.confirm()` / `window.alert()` for destructive or blocking confirmations — they render as an unstyled browser-chrome dialog (shows the raw domain, can't be themed or dismissed via app UI conventions). Use `ConfirmDialog` (`resources/js/components/ConfirmDialog.tsx`) instead — see `docs/reusable.md` for usage.
