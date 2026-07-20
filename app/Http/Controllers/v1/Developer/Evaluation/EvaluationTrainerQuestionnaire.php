<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\BaseController;
use App\Models\EvaluationTrainerQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
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
