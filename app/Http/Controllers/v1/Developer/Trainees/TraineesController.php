<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Trainees;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class TraineesController extends BaseController
{
    protected string $model = Trainees::class;
    protected string $view = 'developer/trainees/index';
    protected array $searchable = ['first_name', 'last_name', 'email', 'mobile_number'];
    protected array $filterable = [
        'status',
        'first_name',
        'last_name',
        'email',
        'batch_id',
        'gender',
        'school_id',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id'
    ];
    protected array $sortable = [
        'status',
        'id',
        'last_name',
        'date_completed',
        'required_hours'
    ];
    protected array $activeColumns = ['id', 'first_name', 'last_name', 'email'];
    protected string $sortBy = 'last_name';
    // Guards deletion if the trainee has uploaded files/documents attached
    protected array $inUseRelations = ['documents'];

    /**
     * Eager-load the industry/program relations so the list serializes their
     * names (as `academic_industry` / `academic_program`) instead of the
     * frontend having to display raw foreign-key ids.
     *
     * @return Builder<Model>
     */
    protected function newQuery(): Builder
    {
        return parent::newQuery()->with([
            'school:id,school_name',
            'batch:id,batch_code,academic_industry_id,academic_program_id,academic_level_id',
            'batch.academicIndustry:id,name',
            'batch.academicProgram:id,name,course_name',
            'batch.academicLevel:id,name,name',
        ]);
    }

    protected function storeRules(): array
    {
        return [
            'batch_id' => ['required', 'exists:app_batches,id'],
            'school_id' => ['required', 'exists:app_settings_partner_schools,id'],
            'public_url_id' => ['required', 'string', 'unique:app_trainees,public_url_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:app_trainees,email'],
            'birthday' => ['required', 'date'],
            'birth_place' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'mobile_number' => ['required', 'string', 'max:50'],
            'landline_number' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'completed_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
            'termination_remarks' => ['nullable', 'string'],
            'address' => ['required', 'string'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'batch_id' => ['required', 'exists:app_batches,id'],
            'school_id' => ['required', 'exists:app_settings_partner_schools,id'],
            'public_url_id' => ['required', 'string', Rule::unique('app_trainees')->ignore($model->id)],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('app_trainees')->ignore($model->id)],
            'birthday' => ['required', 'date'],
            'birth_place' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'mobile_number' => ['required', 'string', 'max:50'],
            'landline_number' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'completed_hours' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
            'termination_remarks' => ['nullable', 'string'],
            'address' => ['required', 'string'],
        ];
    }
}
