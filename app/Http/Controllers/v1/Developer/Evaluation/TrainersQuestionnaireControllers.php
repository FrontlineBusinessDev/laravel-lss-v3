<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\EvaluationTrainersQuestionnaire;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TrainersQuestionnaireControllers extends BaseController
{
    protected string $model = EvaluationTrainersQuestionnaire::class;
    protected string $view = 'developer/evaluation/trainersQuestionnaire/TrainersQuestionnaireTab';
    protected array $searchable = ['status', 'answer_type', 'category'];
    protected array $filterable = ['status', 'answer_type', 'category'];
    protected array $sortable = ['status', 'answer_type', 'category'];
    protected array $activeColumns = ['id', 'answer_type'];
    protected string $sortBy = 'answer_type';


    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'answer_type' => ['required', 'string', 'max:255', 'unique:app_evaluation_trainers_questionnaire,answer_type'],
            'question' => ['nullable', 'string'],
            'section' => ['nullable', 'string'],
            'added_by' => ['nullable', 'string'],
            'mark_as_critical' => ['nullable', 'boolean'],
            'category' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'answer_type' => ['required', 'string', 'max:255', 'unique:app_evaluation_trainers_questionnaire,answer_type'],
            'question' => ['nullable', 'string'],
            'section' => ['nullable', 'string'],
            'added_by' => ['nullable', 'string'],
            'mark_as_critical' => ['nullable', 'boolean'],
            'category' => ['nullable', 'string'],
        ];
    }
}
