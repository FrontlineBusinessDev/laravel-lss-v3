<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicLearningOutcomes;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AcademicLearningOutcomesController extends BaseController
{
    protected string $model = AcademicLearningOutcomes::class;

    protected string $view = 'developer/settings/academic/learning-outcomes/index';

    protected array $searchable = ['learning_outcomes'];

    protected array $filterable = ['academic_industry_id', 'status', 'learning_outcomes'];

    // Id filters must match exactly — a LIKE '%5%' would also match 15/50/…
    protected array $exactFilters = ['status', 'academic_industry_id'];

    protected array $sortable = ['id'];

    // activeColumns override because this table doesn't have a "name" column
    protected array $activeColumns = ['id', 'academic_industry_id'];

    protected string $sortBy = 'id';

    /**
     * Eager-load the industry relation so the list serializes its name (as
     * `academic_industry`) instead of the frontend having to display a raw
     * foreign-key id. Learning outcomes are scoped by industry only — not
     * program — matching how TraineesViewController resolves a trainee's
     * achievable outcomes off their batch's industry.
     *
     * @return Builder<Model>
     */
    protected function newQuery(): Builder
    {
        return parent::newQuery()->with([
            'academicIndustry:id,name',
        ]);
    }

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
        ];
    }
}
