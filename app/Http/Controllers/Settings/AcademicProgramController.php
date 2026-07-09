<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\AcademicProgram;
use Illuminate\Database\Eloquent\Model;

class AcademicProgramController extends BaseController
{
    protected string $model = AcademicProgram::class;
    protected string $view = 'settings/academic/program/index';

    protected array $searchable = ['name', 'course_name', 'specialization'];
    protected array $filterable = ['status'];
    protected array $sortable = ['id', 'name', 'course_name'];

    protected array $activeColumns = ['id', 'name', 'course_name'];
    protected string $sortBy = 'name';

    // Blocks deletion if a batch or learning outcome depends on it
    protected array $inUseRelations = ['batches', 'learningOutcomes'];

    protected function storeRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'course_name' => ['required', 'string', 'max:150'],
            'specialization' => ['nullable', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'course_name' => ['required', 'string', 'max:150'],
            'specialization' => ['nullable', 'string'],
        ];
    }
}
