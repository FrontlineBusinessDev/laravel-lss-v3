<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicProgramType;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AcademicProgramTypeController extends BaseController
{
    protected string $model = AcademicProgramType::class;
    protected string $view = 'developer/settings/academic/program-type/index';
    protected array $searchable = ['name'];
    protected array $filterable = ['status', 'name'];
    protected array $sortable = ['id', 'name'];

    protected array $activeColumns = ['id', 'name'];
    protected string $sortBy = 'name';

    // Blocks deletion if an academic program depends on it
    protected array $inUseRelations = ['programs'];

    
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
