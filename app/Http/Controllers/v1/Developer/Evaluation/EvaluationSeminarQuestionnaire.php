<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\BaseController;
use App\Models\EvaluationSeminarQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Seminar Evaluation question bank (Admin only — gated at the route level by
 * permission:manage evaluation, see routes/web.php). Seminar participants use
 * these questions to assess the resource speaker(s) who conducted the
 * seminar. Plain BaseController CRUD, mirroring BehavioralQuestionController.
 */
class EvaluationSeminarQuestionnaire extends BaseController
{
    protected string $model = EvaluationSeminarQuestion::class;

    protected string $view = 'developer/evaluation/seminar-questionnaire/index';

    protected array $searchable = ['question'];

    protected array $filterable = ['section', 'status', 'type'];

    protected array $exactFilters = ['status', 'type'];

    protected array $sortable = ['order', 'id'];

    protected string $sortBy = 'order';

    protected array $activeColumns = ['id', 'question', 'section', 'type', 'order', 'is_critical', 'status'];

    protected array $inUseRelations = ['answers'];

    protected function storeRules(): array
    {
        return [
            'question' => ['required', 'string'],
            'section' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['rating', 'text'])],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_critical' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::in(Statuses::all())],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return $this->storeRules();
    }

    /** Stamps the creating admin on new questions only — never overwritten on update. */
    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        if ($model === null) {
            $validated['created_by'] = auth()->id();
        }

        return $validated;
    }

    /** Distinct in-use categories (free text, mirrors `app_seminars.type`). */
    public function categories(): JsonResponse
    {
        $inUse = EvaluationSeminarQuestion::query()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json(['data' => $inUse]);
    }

    /**
     * Full (non-paginated) ordered question list for one category — the
     * questionnaire tab groups these by `section` client-side.
     */
    public function forCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(Statuses::all())],
        ]);

        $questions = EvaluationSeminarQuestion::query()
            ->where('category', $validated['category'])
            ->when(
                $validated['search'] ?? null,
                fn($q, $search) => $q->where('question', 'like', "%{$search}%"),
            )
            ->when($validated['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->with('creator:id,first_name,last_name')
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $questions]);
    }

    /**
     * @return array<int, array{label: string, count: int}>
     */
    protected function inUseBlockers(Model $model): array
    {
        $blockers = parent::inUseBlockers($model);

        /** @var EvaluationSeminarQuestion $model */
        if ($model->is_critical) {
            array_unshift($blockers, ['label' => 'Critical question', 'count' => 1]);
        }

        return $blockers;
    }
}
