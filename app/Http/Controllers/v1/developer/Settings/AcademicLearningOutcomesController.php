<?php

namespace App\Http\Controllers\v1\developer\Settings;

use App\Http\Controllers\v1\developer\BaseController;
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

    protected array $filterable = ['academic_industry_id', 'academic_program_id', 'status', 'learning_outcomes'];

    // Id filters must match exactly — a LIKE '%5%' would also match 15/50/…
    protected array $exactFilters = ['status', 'academic_industry_id', 'academic_program_id'];

    protected array $sortable = ['id'];

    // activeColumns override because this table doesn't have a "name" column
    protected array $activeColumns = ['id', 'academic_program_id', 'academic_industry_id'];

    protected string $sortBy = 'id';

    /**
     * Eager-load the industry/program relations so the list serializes their
     * names (as `academic_industry` / `academic_program`) instead of the
     * frontend having to display raw foreign-key ids.
     *
     * @return Builder<Model>
     */
    protected function newQuery(): Builder
    {
        return parent::newQuery()->with([
            'academicIndustry:id,name',
            'academicProgram:id,name,course_name',
        ]);
    }

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
            'academic_program_id' => ['required', 'exists:app_settings_academic_program,id'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
            'academic_program_id' => ['required', 'exists:app_settings_academic_program,id'],
        ];
    }
}
