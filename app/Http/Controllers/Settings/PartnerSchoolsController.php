<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\BaseController;
use App\Models\PartnerSchools;
use App\Support\Statuses;
use App\Traits\HandlesFileUploads;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PartnerSchoolsController extends BaseController
{
    use HandlesFileUploads;

    protected string $model = PartnerSchools::class;
    protected string $view = 'settings/partner-schools/index';
    protected array $searchable = ['school_name', 'abbreviation', 'contact_email', 'contact_first_name', 'contact_last_name', 'physical_address'];
    protected array $filterable = ['status', 'school_name', 'abbreviation', 'contact_email', 'contact_first_name', 'contact_last_name', 'physical_address'];
    protected array $sortable   = ['id', 'school_name', 'status', 'contact_email', 'created_at'];
    // Transforms the stored path into a temporary (presigned) URL on list responses.
    protected array $fileFields = ['image'];

    protected function storeRules(?Model $record = null): array
    {
        return [
            'status'             => ['required', Rule::in(Statuses::all())],
            'school_name'        => ['required', 'string', 'unique:app_settings_partner_schools,school_name'],
            'abbreviation'       => ['required', 'string'],
            'contact_email'      => ['nullable', 'email', 'unique:app_settings_partner_schools,contact_email'],
            'contact_first_name' => ['required', 'string'],
            'contact_last_name'  => ['required', 'string'],
            'physical_address'   => ['nullable', 'string'],
            // `image` is handled/validated in storePartnerImage() — only when an
            // actual file is uploaded — so an unchanged edit (which resubmits the
            // existing URL string) isn't rejected or mass-assigned.
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'status'      => ['required', Rule::in(Statuses::all())],
            'school_name' => [
                'required',
                'string',
                // Check uniqueness but ignore this record's own row.
                Rule::unique('app_settings_partner_schools', 'school_name')->ignore($model->id),
            ],
            'abbreviation'  => ['required', 'string'],
            'contact_email' => [
                'nullable',
                'email',
                Rule::unique('app_settings_partner_schools', 'contact_email')->ignore($model->id),
            ],
            'contact_first_name' => ['required', 'string'],
            'contact_last_name'  => ['required', 'string'],
            'physical_address'   => ['nullable', 'string'],
            // See storeRules(): the logo is validated/handled in storePartnerImage().
        ];
    }

    /**
     * Create a partner school. The logo is stored PRIVATE on the cloud disk and
     * the JSON response returns a temporary (presigned) URL so the frontend can
     * render it without exposing a public object.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());

        if ($path = $this->storePartnerImage($request)) {
            $validated['image'] = $path;
        }

        $model = PartnerSchools::create([
            ...$validated,
            'status' => $validated['status'] ?? self::STATUS_ACTIVE,
        ]);

        return $this->sendResponse($this->transformFileUrls($model), 'Record created successfully.', 201);
    }

    /**
     * Update a partner school, replacing or clearing the private logo as needed
     * and returning a fresh temporary URL in the JSON response.
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $this->normalizeStatusInput($request);
        $validated = $request->validate($this->updateRules($model), $this->validationMessages());

        if ($path = $this->storePartnerImage($request, $model)) {
            $validated['image'] = $path;
        } elseif ($this->fileWasRemoved($request, 'image')) {
            $this->deleteStoredFile($model->image, $this->fileDisk());
            $validated['image'] = null;
        }

        $model->update($validated);

        return $this->sendResponse($this->transformFileUrls($model), 'Record updated successfully.');
    }

    /**
     * Store the uploaded logo on the configured cloud disk as a PRIVATE object,
     * deleting the previous file when replacing. Returns the stored path, or
     * null when the request carried no new file.
     */
    protected function storePartnerImage(Request $request, ?PartnerSchools $model = null): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        // Only validate the upload when one is actually present.
        $request->validate(['image' => ['image', 'max:2048']]);
        $file = $request->file('image');

        if (! $file instanceof UploadedFile) {
            return null;
        }

        if ($model?->image) {
            $this->deleteStoredFile($model->image, $this->fileDisk());
        }

        $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/partner-schools';

        return Storage::disk($this->fileDisk())->putFile($folder, $file, 'private');
    }

    /** Disk backing partner-school logos (the app default disk, e.g. s3/spaces). */
    protected function fileDisk(): string
    {
        return config('filesystems.default');
    }
}
