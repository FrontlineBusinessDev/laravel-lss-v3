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
    protected array $searchable = ['name', 'description'];
    protected array $filterable = ['status', 'name'];
    protected array $sortable = ['id', 'name'];

    protected array $activeColumns = ['id', 'name'];
    protected string $sortBy = 'name';
    // Blocks deletion if referenced by active trainees
    protected array $inUseRelations = ['trainees'];
    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}
