<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Models\PaymentMethod;
use App\Support\PaymentMethodTypes;
use App\Support\Statuses;
use App\Traits\HandlesFileUploads;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentMethodsController extends BaseController
{
    use HandlesFileUploads;

    protected string $model = PaymentMethod::class;
    protected string $view = 'developer/settings/payment-methods/index';
    protected array $searchable = ['provider_name', 'account_name', 'account_number'];
    protected array $filterable = ['status', 'type', 'provider_name'];
    protected array $sortable = ['id', 'provider_name', 'status', 'display_order', 'created_at'];
    protected array $activeColumns = ['id', 'provider_name', 'type'];
    protected string $sortBy = 'display_order';
    protected array $fileFieldFolders = [
        'logo' => 'payment-methods/logos',
        'qr_code' => 'payment-methods/qr-codes',
    ];
    protected array $fileFields = ['logo', 'qr_code'];

    protected function storeRules(): array
    {
        return [
            'status' => ['required', Rule::in(Statuses::all())],
            'provider_name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(PaymentMethodTypes::all())],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'payment_link' => ['nullable', 'url', 'max:2048'],
            'instructions' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer'],
            'logo' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'qr_code' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return $this->storeRules();
    }

    /**
     * transformFileUrls() is only called by BaseController on read paths
     * (show/paginationSearch) — writes must presign here too so the modal's
     * post-save state shows the uploaded logo/QR immediately.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());
        $validated = $this->beforeSave($validated);

        $model = PaymentMethod::create([
            ...$validated,
            'status' => $validated['status'] ?? self::STATUS_ACTIVE,
        ]);

        return $this->sendResponse($this->transformFileUrls($model), 'Record created successfully.', 201);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->updateRules($model), $this->validationMessages());
        $validated = $this->beforeSave($validated, $model);

        $model->update($validated);

        return $this->sendResponse($this->transformFileUrls($model), 'Record updated successfully.');
    }
}
