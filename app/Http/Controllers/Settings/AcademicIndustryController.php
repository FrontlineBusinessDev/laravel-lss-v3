<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\AcademicIndustry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AcademicIndustryController extends BaseController
{
    protected string $model = AcademicIndustry::class;
    protected string $view = 'settings/academic/industry/index';
    protected array $searchable = ['name', 'description'];
    protected array $filterable = ['status'];
    protected array $sortable = ['id', 'name'];
    protected array $activeColumns = ['id', 'name'];
    protected string $sortBy = 'name';

    // Blocks deletion if referenced by batches or learning outcomes
    protected array $inUseRelations = ['batches', 'learningOutcomes'];

    protected function storeRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150', 'unique:app_settings_academic_industry,name'],
            'description' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'name' => ['required', 'string', 'max:150', Rule::unique('app_settings_academic_industry')->ignore($model->id)],
            'description' => ['nullable', 'string'],
        ];
    }
}
