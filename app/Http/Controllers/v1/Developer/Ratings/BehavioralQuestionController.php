<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\BaseController;
use App\Models\BehavioralQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Behavioral Assessment Setup (Admin only — gated at the route level by
 * permission:manage behavioral questions, see routes/web.php). Plain
 * BaseController CRUD; the only override is inUseBlockers(), which adds the
 * is_critical flag as a permanent delete-blocker alongside the normal
 * "still referenced by an evaluation answer" in-use guard.
 */
class BehavioralQuestionController extends BaseController
{
    protected string $model = BehavioralQuestion::class;

    protected string $view = 'developer/ratings/behavioral-setup/index';

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

    /**
     * Distinct in-use sections (free text) — the Setup tab's grouping pills,
     * mirroring EvaluationSeminarQuestionnaire::categories().
     */
    public function sections(): JsonResponse
    {
        $inUse = BehavioralQuestion::query()
            ->whereNotNull('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section');

        return response()->json(['data' => $inUse]);
    }

    /**
     * Full (non-paginated) ordered question list for one section, mirroring
     * EvaluationSeminarQuestionnaire::forCategory().
     */
    public function forSection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section' => ['required', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(Statuses::all())],
        ]);

        $questions = BehavioralQuestion::query()
            ->where('section', $validated['section'])
            ->when(
                $validated['search'] ?? null,
                fn($q, $search) => $q->where('question', 'like', "%{$search}%"),
            )
            ->when($validated['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $questions]);
    }

    /**
     * Persists a drag-and-drop reorder within one section — `ids` is the
     * full, already-reordered id list; each gets its array index as its new
     * `order`. Scoped to whatever subset the caller drags (a full,
     * unfiltered section in practice), so it never touches ids outside it.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:app_behavioral_questions,id'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['ids'] as $index => $id) {
                BehavioralQuestion::where('id', $id)->update(['order' => $index]);
            }
        });

        return response()->json(['success' => true]);
    }

    /**
     * Adds is_critical as a permanent blocker on top of the normal
     * relation-count guard — a critical question can never be hard-deleted,
     * even once archived and unreferenced by any evaluation answer.
     *
     * @return array<int, array{label: string, count: int}>
     */
    protected function inUseBlockers(Model $model): array
    {
        $blockers = parent::inUseBlockers($model);

        /** @var BehavioralQuestion $model */
        if ($model->is_critical) {
            array_unshift($blockers, ['label' => 'Critical question', 'count' => 1]);
        }

        return $blockers;
    }
}
