<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\BaseController;
use App\Models\EvaluationSeminarQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
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
