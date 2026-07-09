<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\AcademicLevel;
use Illuminate\Database\Eloquent\Model;

class AcademicLevelController extends BaseController
{
    protected string $model = AcademicLevel::class;
    protected string $view = 'settings/academic/level/index';
    protected array $searchable = ['name', 'year_level', 'description'];
    protected array $filterable = ['year_level', 'status'];
    protected array $sortable = ['id', 'name', 'year_level'];

    protected array $activeColumns = ['id', 'name', 'year_level'];
    protected string $sortBy = 'year_level';
    // Blocks deletion if referenced by active batches
    protected array $inUseRelations = ['batches'];
    protected function storeRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}
