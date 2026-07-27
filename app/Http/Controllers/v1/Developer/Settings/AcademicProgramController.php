<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicProgram;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AcademicProgramController extends BaseController
{
    protected string $model = AcademicProgram::class;
    protected string $view = 'developer/settings/academic/program/index';
    protected array $searchable = ['name'];
    protected array $filterable = ['status', 'name'];
    protected array $sortable = ['id', 'name'];

    protected array $activeColumns = ['id', 'name'];
    protected string $sortBy = 'name';

    // Blocks deletion if a batch or learning outcome depends on it
    protected array $inUseRelations = ['batches', 'learningOutcomes'];

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
        ];
    }
}
