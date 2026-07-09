<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\AcademicLearningOutcomes;
use Illuminate\Database\Eloquent\Model;

class AcademicLearningOutcomesController extends BaseController
{
    protected string $model = AcademicLearningOutcomes::class;
    protected string $view = 'settings/academic/learning-outcomes/index';
    protected array $searchable = ['learning_outcomes'];
    protected array $filterable = ['academic_industry_id', 'academic_program_id', 'status'];
    protected array $sortable = ['id'];
    // activeColumns override because this table doesn't have a "name" column
    protected array $activeColumns = ['id', 'academic_program_id', 'academic_industry_id'];
    protected string $sortBy = 'id';

    protected function storeRules(): array
    {
        return [
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
            'academic_program_id' => ['required', 'exists:app_settings_academic_program,id'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'learning_outcomes' => ['required', 'string'],
            'academic_industry_id' => ['required', 'exists:app_settings_academic_industry,id'],
            'academic_program_id' => ['required', 'exists:app_settings_academic_program,id'],
        ];
    }
}
