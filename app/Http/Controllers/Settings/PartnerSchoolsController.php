<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\PartnerSchools;
use App\Support\Statuses;
use App\Traits\HandlesFileUploads;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class PartnerSchoolsController extends BaseController
{
    use HandlesFileUploads;
    protected string $model = PartnerSchools::class;
    protected string $view = 'settings/partner-schools/index';
    protected array $searchable = ['name', 'status', 'email', 'physical_address'];
    protected array $filterable = ['name', 'status', 'email'];
    protected array $sortable   = ['id', 'name', 'status', 'email', 'created_at'];
    // Drives both upload handling AND url transformation
    protected array $fileFields = ['image'];
    protected array $fileFieldFolders = ['image' => 'partner-schools'];
    protected function storeRules(?Model $record = null): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'school_name'               => ['required', 'string', 'unique:app_settings_partner_schools,school_name'],
            'abbreviation'              => ['required', 'string'],
            'contact_email'             => ['nullable', 'email', 'unique:app_settings_partner_schools,contact_email'],
            'contact_first_name'        => ['required', 'string'],
            'contact_last_name'         => ['required', 'string'],
            'physical_address'          => ['nullable', 'string'],
            // 'image'                     => ['nullable', 'image', 'max:2048'],
            'image'                     => ['nullable', 'array'],
            'image.files'               => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }
    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'school_name' => [
                'required',
                'string',
                // This tells Laravel: check for uniqueness, but ignore this model's ID
                Rule::unique('app_settings_partner_schools', 'school_name')->ignore($model->id)
            ],
            'abbreviation' => ['required', 'string'],
            'contact_email' => [
                'nullable',
                'email',
                // Ignore this model's ID here as well so email validation doesn't block you
                Rule::unique('app_settings_partner_schools', 'contact_email')->ignore($model->id)
            ],
            'contact_first_name' => ['required', 'string'],
            'contact_last_name'  => ['required', 'string'],
            'physical_address'   => ['nullable', 'string'],
            'image'              => ['nullable', 'array'],
            'image.files'        => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }
}
