<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Trainees;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class TraineesController extends BaseController
{
    protected string $model = Trainees::class;
    protected string $view = 'developer/trainees/index';
    protected array $searchable = ['first_name', 'last_name', 'email', 'mobile_number'];
    protected array $filterable = ['batch_id', 'gender', 'school_id'];
    protected array $sortable = ['id', 'last_name', 'date_completed', 'required_hours'];
    protected array $activeColumns = ['id', 'first_name', 'last_name', 'email'];
    protected string $sortBy = 'last_name';
    // Guards deletion if the trainee has uploaded files/documents attached
    protected array $inUseRelations = ['documents'];

    /**
     * The id is looked up client-side against resources/js/data/mockData.ts
     * — no trainees table exists yet.
     */
    // public function show(string $id): Response
    // {
    //     return Inertia::render('trainees/detail', ['id' => $id])->asCsr();
    // }

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
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
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
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_number' => ['required', 'string', 'max:50'],
            'required_hours' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'date_completed' => ['nullable', 'date'],
            'address' => ['required', 'string'],
        ];
    }
}
