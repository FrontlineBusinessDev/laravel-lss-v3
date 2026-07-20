<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicIndustry;
use App\Models\EvaluationTrainerQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Trainer Evaluation question bank (Admin only — gated at the route level by
 * permission:manage evaluation, see routes/web.php). Trainees use these
 * questions to assess the trainer(s) who supervised their required hours.
 * Plain BaseController CRUD, mirroring BehavioralQuestionController.
 */
class EvaluationTrainerQuestionnaire extends BaseController
{
    protected string $model = EvaluationTrainerQuestion::class;

    protected string $view = 'developer/evaluation/trainer-questionnaire/index';

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
            'academic_industry_id' => ['required', 'integer', 'exists:app_settings_academic_industry,id'],
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

    /**
     * Distinct in-use categories (industries that already have at least one
     * question) plus the full active AcademicIndustry list, so "Add set" can
     * still offer an industry with zero questions yet.
     */
    public function categories(): JsonResponse
    {
        $inUse = EvaluationTrainerQuestion::query()
            ->whereNotNull('academic_industry_id')
            ->join('app_settings_academic_industry', 'app_settings_academic_industry.id', '=', 'app_evaluation_trainer_questions.academic_industry_id')
            ->distinct()
            ->orderBy('app_settings_academic_industry.name')
            ->get(['app_settings_academic_industry.id', 'app_settings_academic_industry.name']);

        $available = AcademicIndustry::query()
            ->where('status', Statuses::ACTIVE)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json(['data' => ['in_use' => $inUse, 'available' => $available]]);
    }

    /**
     * Full (non-paginated) ordered question list for one Academic Industry —
     * the questionnaire tab groups these by `section` client-side.
     */
    public function forCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'academic_industry_id' => ['required', 'integer'],
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(Statuses::all())],
        ]);

        $questions = EvaluationTrainerQuestion::query()
            ->where('academic_industry_id', $validated['academic_industry_id'])
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
     * Adds is_critical as a permanent blocker on top of the normal
     * relation-count guard — mirrors BehavioralQuestionController.
     *
     * @return array<int, array{label: string, count: int}>
     */
    protected function inUseBlockers(Model $model): array
    {
        $blockers = parent::inUseBlockers($model);

        /** @var EvaluationTrainerQuestion $model */
        if ($model->is_critical) {
            array_unshift($blockers, ['label' => 'Critical question', 'count' => 1]);
        }

        return $blockers;
    }
}
