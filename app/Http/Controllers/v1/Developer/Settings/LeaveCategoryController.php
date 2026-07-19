<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\LeaveCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class LeaveCategoryController extends BaseController
{
    protected string $model = LeaveCategory::class;
    protected string $view = 'developer/settings/leave-categories/index';
    protected array $searchable = ['name'];
    protected array $filterable = ['status', 'name'];
    protected array $sortable = ['name', 'max_days', 'max_instances'];
    protected array $activeColumns = ['id', 'name', 'requires_document'];
    protected string $sortBy = 'name';
    protected array $inUseRelations = ['leaveRequests'];

    protected function storeRules(): array
    {
        return [
            'status' => ['required', 'string', 'in:active,inactive'],
            'name' => ['required', 'string', 'max:255', 'unique:app_leave_categories,name'],
            'max_days' => ['nullable', 'integer', 'min:0'],
            'max_instances' => ['nullable', 'integer', 'min:0'],
            'requires_document' => ['sometimes', 'boolean'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status' => ['required', 'string', 'in:active,inactive'],
            'name' => ['required', 'string', 'max:255', Rule::unique('app_leave_categories', 'name')->ignore($model->id)],
            'max_days' => ['nullable', 'integer', 'min:0'],
            'max_instances' => ['nullable', 'integer', 'min:0'],
            'requires_document' => ['sometimes', 'boolean'],
        ];
    }
}
