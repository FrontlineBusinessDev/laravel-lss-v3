<?php

namespace App\Http\Controllers\v1\Developer\Announcement;

use App\Http\Controllers\v1\BaseController;
use App\Models\Announcement;
use App\Support\AnnouncementDispatcher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class AnnoucementController extends BaseController
{
    protected string $model = Announcement::class;
    protected string $view = 'developer/announcements/index';
    protected array $searchable = ['status', 'subject', 'audience', 'description'];
    protected array $filterable = ['status', 'subject', 'audience', 'audience_type', 'audience_batch_id', 'audience_user_ids', 'description'];
    protected array $sortable = ['status', 'subject', 'audience', 'scheduled_at'];
    // audience_batch_id is a numeric FK — must match exactly, not LIKE '%id%'.
    protected array $exactFilters = ['status', 'audience_batch_id'];
    // audience_user_ids is a JSON array column (trainee ids) — match if it
    // contains ANY of the selected trainees, not a flat whereIn().
    protected array $jsonContainsFilters = ['audience_user_ids' => 'audience_user_ids'];
    protected array $activeColumns = ['id', 'subject'];
    protected string $sortBy = 'subject';

    /**
     * `status` is intentionally excluded here — it drives the separate
     * Active/Archive lifecycle (BaseController::archive()/restore()), not the
     * publish-scheduling concern below. New announcements always start active;
     * visibility to the audience is instead gated by scheduled_at/notified_at.
     */
    protected function storeRules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:255', 'unique:app_announcement,subject'],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'audience_type' => ['required', Rule::in(['all', 'batch', 'role', 'custom'])],
            'audience_batch_id' => ['required_if:audience_type,batch', 'nullable', 'integer', 'exists:app_batches,id'],
            'audience' => ['required_if:audience_type,role', 'nullable', 'string', Rule::in(['trainee', 'trainer'])],
            'audience_user_ids' => ['required_if:audience_type,custom', 'nullable', 'array'],
            'audience_user_ids.*' => ['integer', 'exists:app_trainees,id'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'subject' => ['required', 'string', 'max:255', Rule::unique('app_announcement')->ignore($model->id)],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'audience_type' => ['required', Rule::in(['all', 'batch', 'role', 'custom'])],
            'audience_batch_id' => ['required_if:audience_type,batch', 'nullable', 'integer', 'exists:app_batches,id'],
            'audience' => ['required_if:audience_type,role', 'nullable', 'string', Rule::in(['trainee', 'trainer'])],
            'audience_user_ids' => ['required_if:audience_type,custom', 'nullable', 'array'],
            'audience_user_ids.*' => ['integer', 'exists:app_trainees,id'],
        ];
    }

    /** @param Announcement $model */
    protected function afterCreate(Model $model): void
    {
        AnnouncementDispatcher::maybeDispatch($model);
    }
}
