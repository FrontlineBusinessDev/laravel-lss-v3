# Async Select — Convention

`AsyncSelectField` (`resources/js/hooks/use-async-select-field.tsx`) powers both
the `async-select` modal field type (via `RecordModal` → `DynamicField`) and the
page-level filter dropdowns. It stores the value as a bare id and lazily loads
options from a `crudModule` `/lookup` endpoint.

## Rule: show the previously-selected record in edit mode

When a record is edited, the async-select MUST display the currently-selected
record's **name** — never a blank/placeholder — even when that related record is
archived/inactive or not on the first page of the lookup.

Do **not** rely on the mount-time `loadOptions('')` first-page scan to recover
the label. That scan only inspects the first page of the *active-scoped* lookup,
so it silently fails for archived records and for large datasets where the
selected record is paged out.

Instead, seed the label from data already on the row:

1. **Eager-load the relation** on the backend list query so each row carries the
   related name. Override `newQuery()` in the module's controller:

   ```php
   protected function newQuery(): Builder
   {
       return parent::newQuery()->with(['academicIndustry:id,name']);
   }
   ```

   Laravel serializes relations snake_case by default, so `academicIndustry`
   arrives on the client as `academic_industry`.

2. **Declare `initialLabel`** on the async-select `FieldDef` (a per-row resolver
   reading the label off the eager-loaded relation):

   ```ts
   {
       key: 'academic_industry_id',
       type: 'async-select',
       loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
       initialLabel: (row) => row.academic_industry?.name,
   }
   ```

3. `RecordModal` passes `initialLabel` to `AsyncSelectField` in edit mode; the
   control seeds `selectedLabel` from it and renders the name immediately. When
   `initialLabel` is absent it falls back to the old first-page scan, so this is
   fully backward compatible.

Also remember to extend the module's TS interface with the eager-loaded relation
(e.g. `academic_industry?: { id: number; name: string } | null`) so `initialLabel`
and the list cells are typed.

## Menu overflow

The open menu is rendered into a `document.body` portal with `position: fixed`,
anchored to the trigger's bounding rect (and flipped upward when there isn't
room below). This lets it escape any `overflow:auto` / `max-h` ancestor — e.g. a
`RecordModal` / `Modal` body — so the list overlaps the modal cleanly instead of
forcing an inner scrollbar. This is the reusable equivalent of react-select's
`menuPortalTarget={document.body}`; every async-select gets it for free, so no
per-call CSS (`overflow-visible`, `z-index`) is needed on modal containers.

## Filters

Page filter dropdowns bind through `extraFilters` + `filterControls` — plain
React state merged into the TanStack Query params by `useCrud`, which refetches
`{apiUrl}/pagination-search` automatically. They do **not** use Inertia
`router`/`useForm` or Ziggy. See `docs/state-management.md` and the reference
implementation in
`resources/js/pages/settings/academic/learning-outcomes/index.tsx`.
