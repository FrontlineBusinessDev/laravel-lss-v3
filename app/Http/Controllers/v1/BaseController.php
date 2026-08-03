<?php

namespace App\Http\Controllers\v1;

use App\Http\Responses\InertiaPageResponse;
use App\Support\Statuses;
use App\Traits\HandlesFileUploads;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

abstract class BaseController extends Controller implements HasMiddleware
{
    use AuthorizesRequests, HandlesFileUploads;
    public const STATUS_ACTIVE = Statuses::ACTIVE;
    public const STATUS_INACTIVE = Statuses::INACTIVE;
    /** Fully qualified model class for this module. Set by child when using the CRUD helpers below. */
    protected string $model;
    /** Inertia page component path for the CSR shell. Set by child. */
    protected string $view;
    /** Columns allowed for the global "search" param */
    protected array $searchable = [];
    /** Columns allowed for per-column filters[col]=value */
    protected array $filterable = [];
    /**
     * Filterable columns matched with `=` instead of `LIKE`.
     * `status` MUST be exact: a LIKE '%active%' would also match 'inactive'.
     *
     * @var list<string>
     */
    protected array $exactFilters = ['status'];
    /** Columns allowed for sort_by */
    protected array $sortable = ['id'];
    /** Optional resource class to transform output, e.g. UserResource::class */
    protected ?string $resource = null;
    /** Columns returned by the lightweight searchActive() lookup. */
    protected array $activeColumns = ['id', 'name'];
    /** Default sort column. */
    protected string $sortBy = 'name';
    /** Check if associated to other modules. */
    protected array $inUseRelations = [];
    /** Optional relation => display-label overrides for inUse()/inUseBlockers(), e.g. ['assignedBatches' => 'Batches (as trainer)']. Falls back to ucfirst($relation). */
    protected array $inUseLabels = [];
    /**
     * Filter keys that live on a related model rather than this model's own
     * table. Map: filter key => dot-path 'relation.column' (may traverse
     * nested relations, e.g. 'batch.academic_industry_id').
     * Applied via `whereHas` instead of a flat `where`.
     *
     * @var array<string, string>
     */
    protected array $relationFilters = [];
    /**
     * Map of field name => storage subfolder.
     * Override in child controllers.
     * e.g. ['image' => 'partner-schools', 'attachment' => 'documents']
     */
    protected array $fileFieldFolders = [];
    /**
     * File fields that should be transformed to full URLs in the response.
     * Override in child controllers.
     * e.g. ['image', 'attachment']
     */
    protected array $fileFields = [];
    /** Duration in minutes for presigned URLs. Override in child controllers. */
    protected int $fileUrlExpiry = 60;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'throttle:120,1'])];
    }

    public function index(Request $request): mixed
    {
        /** @disregard P1013 */ // this disregard the error below but it works
        $user = auth()->user();
        $props = ['user' => $user];
        // Use CSR for authenticated
        return InertiaPageResponse::csr($this->view, $props);
    }
    public function show(int|string $id): mixed
    {
        $model = $this->resolveModel($id);
        $this->authorize('view', $model);
        // Process data through an optional Resource class, or fall back to file URL mutations
        $record = $this->resource
            ? new $this->resource($model)
            : $this->transformFileUrls($model);
        /** @disregard P1013 */
        $user = auth()->user();
        $props = ['user' => $user, 'record' => $record];
        // Pass the flat $props array directly into your CSR shell
        return InertiaPageResponse::csr($this->view, $props);
    }
    public function showPublicId(string $publicId): mixed
    {
        $model = $this->resolveModelByPublicId($publicId);
        $this->authorize('view', $model);
        // Process data through an optional Resource class, or fall back to file URL mutations
        $record = $this->resource
            ? new $this->resource($model)
            : $this->transformFileUrls($model);
        /** @disregard P1013 */
        $user = auth()->user();
        $props = ['user' => $user, 'record' => $record];
        // Pass the flat $props array directly into your CSR shell
        return InertiaPageResponse::csr($this->view, $props);
    }
    public function paginationSearch(Request $request): JsonResponse
    {
        $query = $this->newQuery($request);
        $search = $request->string('search')->toString();
        if ($search !== '' && $this->searchable) {
            $this->applySearchTerms($query, $this->searchable, $search);
        }
        foreach ((array) $request->input('filters', []) as $col => $value) {
            if (is_array($value)) {
                $cleanedValue = array_values(array_filter(
                    $value,
                    fn($v) => $v !== null && $v !== '',
                ));
                $isEmpty = count($cleanedValue) === 0;
            } else {
                $cleanedValue = is_string($value) ? trim($value) : $value;
                $isEmpty = $cleanedValue === '';
            }
            if ($isEmpty || ! in_array($col, $this->filterable, true)) {
                continue;
            }
            // Filter keys that live on a related model (declared in
            // $relationFilters) are applied via whereHas instead of a flat
            // where — the column doesn't exist on this model's own table.
            if (array_key_exists($col, $this->relationFilters)) {
                $this->applyRelationFilter($query, $this->relationFilters[$col], $cleanedValue);
                continue;
            }
            if (is_array($cleanedValue)) {
                // Multi-select filter — match any of the given values.
                $query->whereIn($col, $cleanedValue);
            } elseif (in_array($col, $this->exactFilters, true)) {
                // Exact match for columns like `status` (so 'active' doesn't
                // also match 'inactive'); LIKE for everything else.
                $query->where($col, $cleanedValue);
            } else {
                $query->where($col, 'like', "%{$cleanedValue}%");
            }
        }
        $sortBy = $request->string('sort_by', 'id')->toString();
        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        if (in_array($sortBy, $this->sortable, true)) {
            $query->orderBy($sortBy, $sortDir);
        }
        $perPage = (int) $request->input('per_page', 10);
        $paginator = $query->paginate(max(1, min($perPage, 100)));
        $paginatedData = [
            'data' => $this->resource
                ? $this->resource::collection($paginator->items())
                : collect($paginator->items())->map(fn($item) => $this->transformFileUrls($item)),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'links' => [
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'filterable' => $this->filterable,
            'searchable' => $this->searchable,
            'filters' => $request->input('filters', []),
            'search' => $search,
            'sort_by' => $sortBy,
            'sort_dir' => $sortDir,
        ];
        return $this->sendResponse($paginatedData);
    }

    /**
     * Applies a filter declared in $relationFilters via whereHas, traversing
     * a dot-path of relation names down to the final column.
     */
    protected function applyRelationFilter(Builder $query, string $path, mixed $value): void
    {
        $segments = explode('.', $path);
        $column = array_pop($segments);
        $this->nestedWhereHas($query, $segments, $column, $value);
    }

    /** @param list<string> $relations */
    protected function nestedWhereHas(Builder $query, array $relations, string $column, mixed $value): void
    {
        $relation = array_shift($relations);
        $query->whereHas($relation, function (Builder $q) use ($relations, $column, $value) {
            if (empty($relations)) {
                is_array($value) ? $q->whereIn($column, $value) : $q->where($column, $value);

                return;
            }
            $this->nestedWhereHas($q, $relations, $column, $value);
        });
    }

    public function searchActive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $results = $this->newQuery()
            ->where('status', self::STATUS_ACTIVE)
            ->when($validated['q'] ?? null, fn(Builder $q, string $term) => $this->applySearch($q, $term))
            ->orderBy($this->sortBy)
            ->limit($validated['limit'] ?? 20)
            ->get($this->activeColumns);

        return response()->json($results);
    }
    /**
     * Paginated, status-aware option lookup for async-select dropdowns.
     *
     * Unlike searchActive() (flat, active-only), this supports infinite scroll
     * via page/per_page and lets the caller choose the status scope:
     *   - status=active   (default) → only active rows
     *   - status=inactive          → only inactive rows
     *   - status=all               → no status constraint
     *
     * Returns the shared { data, meta } envelope so the client can drive
     * "load next page" from meta.current_page < meta.last_page.
     */
    public function lookup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:active,inactive,all'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);
        $status = $validated['status'] ?? 'active';
        $query = $this->newQuery()
            ->when($status !== 'all', fn(Builder $q) => $q->where(
                'status',
                $status === 'inactive' ? self::STATUS_INACTIVE : self::STATUS_ACTIVE,
            ))
            ->when($validated['q'] ?? null, fn(Builder $q, string $term) => $this->applySearch($q, $term))
            ->orderBy($this->sortBy);

        $paginator = $query->paginate(
            perPage: $validated['per_page'] ?? 20,
            columns: $this->activeColumns,
            page: $validated['page'] ?? 1,
        );
        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        // Fix: Normalize input directly inside the request parameters
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());
        $validated = $this->beforeSave($validated);
        // Default to active unless beforeSave() already set a status (e.g. Tickets'
        // lifecycle stage, which is a different concern from the active/inactive
        // archive flag this default serves for Clients/Assignees/Users/Roles).
        $model = ($this->model)::create([...$validated, 'status' => $validated['status'] ?? self::STATUS_ACTIVE]);
        $this->afterCreate($model);
        return $this->sendResponse($model, 'Record created successfully.', 201);
    }
    public function update(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        // Fix: Normalize input directly inside the request parameters
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->updateRules($model), $this->validationMessages());
        $validated = $this->beforeSave($validated, $model);
        $model->update($validated);
        $this->afterUpdate($model);
        return $this->sendResponse($model, 'Record updated successfully.');
    }
    public function archive(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('archive', $model);
        $model->update(['status' => self::STATUS_INACTIVE]);

        return $this->sendResponse($model, 'Record archived successfully.');
    }
    public function restore(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('restore', $model);
        $model->update(['status' => self::STATUS_ACTIVE]);

        return $this->sendResponse($model, 'Record restored successfully.');
    }
    /**
     * Safely mutates any inbound boolean/string variants into explicit 
     * 'active' or 'inactive' status values before validation runs.
     */
    protected function normalizeStatusInput(Request $request): void
    {
        if ($request->has('status')) {
            $statusInput = $request->input('status');
            if ($statusInput === false || $statusInput === 'false' || $statusInput === 0 || $statusInput === '0') {
                $request->merge(['status' => self::STATUS_INACTIVE]);
            } elseif ($statusInput === true || $statusInput === 'true' || $statusInput === 1 || $statusInput === '1') {
                $request->merge(['status' => self::STATUS_ACTIVE]);
            }
        }
    }
    /**
     * Relations to count when checking if a record is in use.
     * Override in child controllers to enable the in-use guard.
     * e.g. ['users', 'courses'] → checks users_count and courses_count
     */
    public function inUse(int|string $id): JsonResponse
    {
        if (empty($this->inUseRelations)) {
            return $this->sendResponse([]);
        }
        $model = $this->newQuery()
            ->withCount($this->inUseRelations)
            ->findOrFail($id);

        $usages = [];
        foreach ($this->inUseRelations as $relation) {
            // withCount()/loadCount() always snake_case the count attribute,
            // regardless of the (often camelCase) relation method name.
            $countKey = Str::snake($relation) . '_count';
            $usages[] = [
                'label' => $this->inUseLabels[$relation] ?? ucfirst($relation),
                'count' => $model->{$countKey} ?? 0,
            ];
        }

        return $this->sendResponse($usages, 'Records Existed');
    }
    public function destroy(int|string $id): JsonResponse
    {
        // Run the guard + delete inside one transaction with a row lock so a
        // concurrent request can't slip a new reference in between the in-use
        // count and the delete. The FKs don't protect us here (users.role_id is
        // nullOnDelete, model_has_roles.role_id is cascadeOnDelete — both allow
        // the delete), so this app-level recount is the real enforcement.
        return DB::transaction(function () use ($id) {
            $model = $this->newQuery()->lockForUpdate()->findOrFail($id);
            $this->authorize('delete', $model);

            // Rule: only inactive (archived) records may be hard-deleted.
            abort_if($model->status === self::STATUS_ACTIVE, 422, 'Set to inactive before deleting.');

            // Rule B: an inactive record still referenced by another module is
            // blocked. Re-counted here under the lock.
            $blocking = $this->inUseBlockers($model);
            if (! empty($blocking)) {
                return $this->sendError('This record is still in use and cannot be deleted.', ['in_use' => $blocking], 422);
            }

            try {
                $model->delete();
            } catch (QueryException $e) {
                // Final integrity backstop if a restrictive FK rejects the delete.
                return $this->sendError('This record is still in use and cannot be deleted.', ['in_use' => $blocking], 422);
            }

            return response()->json(null, 204);
        });
    }
    /**
     * Resolve the list of relations currently blocking deletion of $model.
     * Returns an empty array when nothing is blocking (or no relations configured).
     * Shared so child controllers can run the same guard from an overridden destroy().
     *
     * @return array<int, array{label: string, count: int}>
     */
    protected function inUseBlockers(Model $model): array
    {
        if (empty($this->inUseRelations)) {
            return [];
        }
        $model->loadCount($this->inUseRelations);
        return collect($this->inUseRelations)
            ->filter(fn($relation) => $model->{Str::snake($relation) . '_count'} > 0)
            ->map(fn($relation) => [
                'label' => $this->inUseLabels[$relation] ?? ucfirst($relation),
                'count' => $model->{Str::snake($relation) . '_count'},
            ])
            ->values()
            ->all();
    }
    /**
     * Send a successful JSON response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function sendResponse(mixed $data, string $message = '', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
    /**
     * Send an error JSON response.
     *
     * @param string $message
     * @param array $errors
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function sendError(string $message, array $errors = [], int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }
    protected function applySearch(Builder $query, string $term): Builder
    {
        $this->applySearchTerms($query, $this->searchable, $term);

        return $query;
    }

    /**
     * Splits $search into whitespace-separated terms and requires each term
     * to match at least one of $columns (AND across terms, OR across
     * columns per term) — so a multi-word query like "Juan Dela Cruz" can
     * match a row whose name is split across first_name/last_name, instead
     * of requiring the whole string to appear in a single column.
     *
     * @param list<string> $columns
     */
    protected function applySearchTerms(Builder $query, array $columns, string $search): void
    {
        $terms = preg_split('/\s+/', trim($search), -1, PREG_SPLIT_NO_EMPTY);

        $query->where(function (Builder $outer) use ($columns, $terms) {
            foreach ($terms as $term) {
                $outer->where(function (Builder $inner) use ($columns, $term) {
                    foreach ($columns as $column) {
                        $inner->orWhere($column, 'like', "%{$term}%");
                    }
                });
            }
        });
    }
    protected function newQuery(): Builder
    {
        return ($this->model)::query();
    }
    protected function resolveModel(int|string $id): Model
    {
        return $this->newQuery()->findOrFail($id);
    }
    /** Override in modules that use store(). */
    protected function storeRules(): array
    {
        return [];
    }
    /** Override in modules that use update(). */
    protected function updateRules(Model $model): array
    {
        return [];
    }
    /**
     * Custom validation messages for store()/update(), keyed as `field.rule`.
     * Override in child controllers to tailor a specific message.
     * @return array<string, string>
     */
    protected function validationMessages(): array
    {
        return [];
    }
    // Add no-op defaults so child classes override only what they need
    protected function afterCreate(Model $model): void {}
    protected function afterUpdate(Model $model): void {}
    protected function beforeCreate(Model $model): void {}
    protected function beforeUpdate(Model $model): void {}
    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        return $validated;
    }
    /**
     * Resolve the model instance using its public_id.
     */
    protected function resolveModelByPublicId(string $publicId): Model
    {
        return $this->newQuery()->where('public_id', $publicId)->firstOrFail();
    }
}
