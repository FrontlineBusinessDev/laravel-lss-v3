<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\CertificateTemplate;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CertificateTemplateController extends BaseController
{
    protected string $model = CertificateTemplate::class;
    protected string $view = 'developer/certificates/citations/index';
    protected array $searchable = ['name'];
    protected array $filterable = ['status', 'certificate_type'];
    protected array $exactFilters = ['status', 'certificate_type'];
    protected array $sortable = ['id', 'name', 'status', 'created_at'];
    protected array $activeColumns = ['id', 'name', 'certificate_type'];
    protected string $sortBy = 'name';

    protected function storeRules(): array
    {
        return [
            'certificate_type' => ['required', Rule::in(['trainee', 'seminar', 'citation'])],
            'name' => ['required', 'string', 'max:255'],
            'layout' => ['required', 'array'],
            'layout.*.id' => ['required', 'string'],
            'layout.*.type' => ['required', Rule::in(['text', 'image', 'qr', 'line'])],
            'layout.*.x' => ['required', 'numeric'],
            'layout.*.y' => ['required', 'numeric'],
            'layout.*.width' => ['required', 'numeric'],
            'layout.*.height' => ['nullable', 'numeric'],
            'page_size' => ['nullable', Rule::in(['a4', 'letter'])],
            'orientation' => ['nullable', Rule::in(['portrait', 'landscape'])],
            'is_default' => ['nullable', 'boolean'],
            'status' => ['required', Rule::in(Statuses::all())],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return $this->storeRules();
    }

    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        if (! $model) {
            $validated['created_by'] = auth()->id();
        }

        return $validated;
    }

    /**
     * Extends the base lookup() with a required certificate_type scope, so
     * each certificate type's template picker only ever sees its own set —
     * templates are never cross-listed between trainee/seminar/citation.
     */
    public function lookup(Request $request): JsonResponse
    {
        $type = $request->string('certificate_type')->toString();
        if (! in_array($type, ['trainee', 'seminar', 'citation'], true)) {
            return parent::lookup($request);
        }

        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = CertificateTemplate::query()
            ->where('status', self::STATUS_ACTIVE)
            ->where('certificate_type', $type)
            ->when($validated['q'] ?? null, fn(Builder $q, string $term) => $q->where('name', 'like', "%{$term}%"))
            ->orderBy('name');

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
}
