<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicLevel;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AcademicLevelController extends BaseController
{
    protected string $model = AcademicLevel::class;
    protected string $view = 'developer/settings/academic/level/index';
    protected array $searchable = ['name', 'year_level', 'description'];
    protected array $filterable = ['status', 'name', 'year_level'];
    protected array $sortable = ['id', 'name', 'year_level'];

    protected array $activeColumns = ['id', 'name', 'year_level'];
    protected string $sortBy = 'year_level';
    // Blocks deletion if referenced by active batches
    protected array $inUseRelations = ['batches'];
    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}
