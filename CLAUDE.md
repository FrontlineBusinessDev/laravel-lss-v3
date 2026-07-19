# CLAUDE.md

## 🛠️ Tech Stack & Core Constraints

- **Stack:** Laravel, React, Inertia.js, Tailwind v4 (Inline `className` utilities only).
- **Strict Limits:** Max 300 lines per file. Max 3 levels of indentation/nesting in functions.
- **Data Flow:** Rely on Laravel Controller props via Inertia. For async actions (e.g., filters), use Axios/Ziggy routing. No direct decoupled API fetching patterns.
- **Forms & Validation:** React Hook Form + Zod for client-side state/validation. Match backend Laravel Form Requests rules.
- **Tailwind Rule:** If utility classes are repeated across >8 elements, extract them into an atomic component (e.g., `Button`, `Card`).
- **Output Format:** Provide only production-ready code. No placeholders, no explanations of obvious code.

## 📂 Project Architecture & Directory Pattern

### Frontend Layout (Scoped by Role)

`resources/js/pages/{role_name}/`

- E.g., `pages/developer/`, `pages/trainers/`, `pages/trainee/`, `pages/admin/`
- **[CRITICAL DRY RULE]:** `pages/developer/` & `pages/admin/` -> The Admin and Developer views must reference and reuse the exact same core UI components and layouts to avoid duplication.
- **Admin Route Exception:** The admin dashboard does not have a separate "Roles" sub-page. Activating the users domain must route directly to the main users management matrix.

### Routing & Controllers

- Every individual page view or active tab panel maps directly to its own unique controller handler under `app/Http/Controllers`.

## 🔒 User Status & Access Control

- **Permitted Statuses:** Only `Active` and `Archive` (Archive = Suspended).
- **Authentication Block:** Any entity marked as `Archive` must be explicitly blocked from creating a session or logging into the platform.

## 🧠 System Context & Component Reuse

### Before Coding Check

1. Search workspace to reuse existing utilities, components, hooks, or types.
2. Extend existing logic; do not duplicate code.

### Critical Files for Reference

- **Data Table / Filters Pattern:** `resources/js/components/table/DataTableField.tsx` (Use for async multi-select filters, status toggles, and column searches).
- **Shared Assets:** Global UI components live in `resources/js/components/*`; custom hooks live in `resources/js/hooks/*`.
- **RBAC (Spatie Permissions) Backend:** `app/Http/Controllers/Settings/RolesController.php`
- **RBAC Management UI:** `resources/js/pages/settings/roles/index.tsx`
- **Visual Mockups:** Layout variations and edits are frozen unless a matching asset is found in `docs/img/`.

# Developer Guidelines & Patterns

## Folder & Architecture Rules

- **Controllers Layer**: All custom controllers must live in `app/Http/Controllers/v1` and extend `App\Http\Controllers\v1\BaseController`.
- **API Service Layer**: Always centralize network/state actions inside `resources/js/api-service-layer/` mapped via dedicated frontend namespaces.
- **DataTables Custom Fields**: UI tables must implement `DataTableField` and provide uniform filtration matrices based on standard properties.
- **Layout Structuring**: All ratings related subviews inside `resources/js/pages/developer/ratings` must inherit from `resources/js/layouts/ratings/RatingsPrimaryLayout.tsx`.

## Coding Style & Patterns

- **Namespaces**: Always declare or wrap types and API structures within semantic namespaces (`export namespace ...`) to maintain strict typing across operations.
- **Type-Safe Props**: Ensure components explicitly type props using internal structures or generated model contracts. Use standard camelCase mappings for visual components.
