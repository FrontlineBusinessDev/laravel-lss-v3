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
    protected array $searchable = ['name', 'abbreviation'];
    protected array $filterable = ['status', 'name', 'abbreviation'];
    protected array $sortable = ['id', 'name', 'abbreviation'];

    protected array $activeColumns = ['id', 'name', 'abbreviation'];
    protected string $sortBy = 'name';

    // Blocks deletion if a batch depends on it
    protected array $inUseRelations = ['batches'];

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
        ];
    }
}
