<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\BaseController;
use App\Models\CertificateTemplate;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CertificateTemplateController extends BaseController
{
    protected string $model = CertificateTemplate::class;
    protected string $view = 'developer/certificates/templates/index';
    protected array $searchable = ['name'];
    protected array $filterable = ['status', 'certificate_type'];
    protected array $exactFilters = ['status', 'certificate_type'];
    protected array $sortable = ['id', 'name', 'status', 'created_at'];
    protected array $activeColumns = ['id', 'name', 'certificate_type', 'is_default'];
    protected string $sortBy = 'name';

    protected function storeRules(): array
    {
        return [
            'certificate_type' => ['required', Rule::in(['trainee', 'seminar'])],
            'name' => ['required', 'string', 'max:255'],
            'layout' => ['required', 'array'],
            'layout.*.id' => ['required', 'string'],
            'layout.*.type' => ['required', Rule::in(['text', 'image', 'qr', 'line', 'outcomes', 'shape', 'signature'])],
            'layout.*.x' => ['required', 'numeric'],
            'layout.*.y' => ['required', 'numeric'],
            'layout.*.width' => ['required', 'numeric'],
            'layout.*.height' => ['nullable', 'numeric'],
            'layout.*.rotation' => ['nullable', 'numeric'],
            'layout.*.token' => ['nullable', 'string', 'max:255'],
            'layout.*.text' => ['nullable', 'string', 'max:1000'],
            // Unbounded: pasted image URLs are normally short, but a cropped
            // image is saved as a data URL straight into this JSON column —
            // the column itself is unbounded, so this must be too.
            'layout.*.src' => ['nullable', 'string'],
            'layout.*.fontSize' => ['nullable', 'numeric'],
            'layout.*.fontWeight' => ['nullable', Rule::in(['normal', 'bold'])],
            'layout.*.fontFamily' => ['nullable', 'string', 'max:100'],
            'layout.*.align' => ['nullable', Rule::in(['left', 'center', 'right'])],
            'layout.*.color' => ['nullable', 'string', 'max:32'],
            'layout.*.columns' => ['nullable', 'integer', 'min:1', 'max:3'],
            'layout.*.shape' => ['nullable', Rule::in(['rectangle', 'circle'])],
            'layout.*.fill' => ['nullable', 'string', 'max:32'],
            'layout.*.strokeWidth' => ['nullable', 'numeric', 'min:0', 'max:40'],
            'page_size' => ['nullable', Rule::in(['a4', 'letter'])],
            'orientation' => ['nullable', Rule::in(['portrait', 'landscape'])],
            'is_default' => ['nullable', 'boolean'],
            'background_color' => ['nullable', 'string', 'max:9'],
            'border_color' => ['nullable', 'string', 'max:9'],
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
     * Full template record (including layout, deliberately excluded from
     * lookup()'s $activeColumns — templates can embed large data-URL images)
     * — used by the Issue-certificate modal to build a live preview of the
     * certificate before confirming issuance.
     */
    public function previewData(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);

        return $this->sendResponse($model);
    }

    /**
     * Marks this template as the default for its certificate_type, atomically
     * unsetting whichever template previously held that flag so at most one
     * default ever exists per type — the fallback TraineeCertificateController
     * and SeminarCertificateController resolve to when no template is chosen.
     */
    public function setDefault(int|string $id): JsonResponse
    {
        /** @var CertificateTemplate $model */
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);

        DB::transaction(function () use ($model) {
            CertificateTemplate::where('certificate_type', $model->certificate_type)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $model->update(['is_default' => true]);
        });

        return $this->sendResponse($model->fresh(), 'Default template updated.');
    }

    /** Default (is_default) templates are protected from archiving — they're the fallback every issue flow relies on. */
    public function archive(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        abort_if($model->is_default, 422, 'Default templates cannot be archived.');

        return parent::archive($id);
    }

    /**
     * Adds is_default as a permanent blocker on top of the normal relation-
     * count guard — a default template can never be hard-deleted, even once
     * archived and unreferenced, mirroring BehavioralQuestionController's
     * is_critical pattern.
     *
     * @return array<int, array{label: string, count: int}>
     */
    protected function inUseBlockers(Model $model): array
    {
        $blockers = parent::inUseBlockers($model);

        /** @var CertificateTemplate $model */
        if ($model->is_default) {
            array_unshift($blockers, ['label' => 'Default template', 'count' => 1]);
        }

        return $blockers;
    }

    /**
     * Extends the base lookup() with a required certificate_type scope, so
     * each certificate type's template picker only ever sees its own set —
     * templates are never cross-listed between trainee/seminar/citation.
     */
    public function lookup(Request $request): JsonResponse
    {
        $type = $request->string('certificate_type')->toString();
        if (! in_array($type, ['trainee', 'seminar'], true)) {
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
