<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\AcademicProgram;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
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

    // Blocks deletion if a batch or learning outcome depends on it
    protected array $inUseRelations = ['batches', 'learningOutcomes'];

    /**
     * Eager-load the type relation so the list serializes its name (as
     * `academic_program_type`) instead of the frontend having to display a
     * raw foreign-key id.
     *
     * @return Builder<Model>
     */
    protected function newQuery(): Builder
    {
        return parent::newQuery()->with('academicProgramType:id,name');
    }

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
            'academic_program_type_id' => ['nullable', 'exists:app_settings_academic_program_type,id'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'name' => ['required', 'string', 'max:150'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
            'academic_program_type_id' => ['nullable', 'exists:app_settings_academic_program_type,id'],
        ];
    }
}
