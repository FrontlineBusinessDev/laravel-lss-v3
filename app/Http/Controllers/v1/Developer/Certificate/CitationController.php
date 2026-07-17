<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\CertificateCitation;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CitationController extends BaseController
{
    protected string $model = CertificateCitation::class;
    protected string $view = 'developer/certificates/citations/index';
    protected array $searchable = ['title', 'body_text'];
    protected array $filterable = ['status', 'applies_to'];
    protected array $exactFilters = ['status', 'applies_to'];
    protected array $sortable = ['id', 'title', 'status', 'created_at'];
    protected array $activeColumns = ['id', 'title', 'applies_to'];
    protected string $sortBy = 'title';
    protected array $inUseRelations = ['traineeCertificates', 'seminarCertificates'];

    protected function storeRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'applies_to' => ['required', Rule::in(['trainee', 'seminar', 'both'])],
            'body_text' => ['required', 'string'],
            'critical' => ['nullable', 'boolean'],
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
     * Extends the base lookup() with an optional applies_to filter, so the
     * Issue-certificate modal's Citation select only offers citations valid
     * for the certificate type it's issuing (trainee/seminar/both).
     */
    public function lookup(Request $request): JsonResponse
    {
        $appliesTo = $request->string('applies_to')->toString();
        if (! in_array($appliesTo, ['trainee', 'seminar'], true)) {
            return parent::lookup($request);
        }

        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = CertificateCitation::query()
            ->where('status', self::STATUS_ACTIVE)
            ->whereIn('applies_to', [$appliesTo, 'both'])
            ->when($validated['q'] ?? null, fn(Builder $q, string $term) => $q->where('title', 'like', "%{$term}%"))
            ->orderBy('title');

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
