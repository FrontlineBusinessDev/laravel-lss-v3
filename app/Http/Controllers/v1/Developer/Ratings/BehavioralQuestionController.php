<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\BehavioralQuestion;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
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
