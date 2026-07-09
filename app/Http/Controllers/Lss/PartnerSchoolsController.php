<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\BaseController;
use App\Models\PartnerSchools;
use App\Traits\HandlesFileUploads;
use Illuminate\Database\Eloquent\Model;

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
            'name'             => ['required', 'string', 'unique:app_settings_partner_schools,name'],
            'abbreviation'     => ['required', 'string'],
            'contact'          => ['required', 'string'],
            'email'            => ['nullable', 'email', 'unique:app_settings_partner_schools,email'],
            'physical_address' => ['nullable', 'string'],
            // 'image'            => ['nullable', 'image', 'max:2048'],
            'image'            => ['nullable', 'array'],
            'image.files'      => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }
    protected function updateRules(Model $model): array
    {
        return [
            'name'             => ['required', 'string', 'unique:app_settings_partner_schools,name,' . $model->id],
            'abbreviation'     => ['required', 'string'],
            'contact'          => ['required', 'string'],
            'email'            => ['nullable', 'email', 'unique:app_settings_partner_schools,email,' . $model->id],
            'physical_address' => ['nullable', 'string'],
            // 'image'            => ['nullable', 'image', 'max:2048'],
            'image'            => ['nullable', 'array'],
            'image.files'      => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }
}
