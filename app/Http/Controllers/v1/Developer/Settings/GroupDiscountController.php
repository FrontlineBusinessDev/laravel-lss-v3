<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\GroupDiscount;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupDiscountController extends BaseController
{
    protected string $model = GroupDiscount::class;
    protected string $view = 'developer/settings/rates/group-discounts/index';
    protected array $sortable = ['min_trainees'];
    protected array $activeColumns = ['id', 'min_trainees', 'discount_percentage'];
    protected string $sortBy = 'min_trainees';

    protected function storeRules(): array
    {
        return [
            'min_trainees' => ['required', 'integer', 'min:0', 'unique:app_settings_group_discounts,min_trainees'],
            'discount_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'min_trainees' => ['required', 'integer', 'min:0', Rule::unique('app_settings_group_discounts', 'min_trainees')->ignore($model->id)],
            'discount_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    // These three tables have no `status` column, so BaseController's
    // status-default/status-guard store/update/destroy don't apply here.
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());
        $model = ($this->model)::create($validated);
        return $this->sendResponse($model, 'Record created successfully.', 201);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate($this->updateRules($model), $this->validationMessages());
        $model->update($validated);
        return $this->sendResponse($model, 'Record updated successfully.');
    }

    public function destroy(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('delete', $model);
        $model->delete();
        return response()->json(null, 204);
    }
}
