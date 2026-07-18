<?php

namespace App\Http\Controllers\v1\Trainer\Announcements;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Announcement;
use App\Models\Batches;
use App\Support\AnnouncementDispatcher;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * Trainer-facing Announcements: the list shows announcements the trainer
 * authored, plus anything reaching their assigned batches (admin/developer
 * `all` broadcasts, `role=trainer` broadcasts, or `batch`-targeted posts
 * aimed at one of their batches). Creation/editing is restricted to
 * audience_type=batch, targeting only their own assigned batch(es) — see
 * AnnouncementPolicy for the row-level ownership guard on update/archive/delete.
 */
class AnnouncementsController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Announcement::class;

    protected string $view = 'trainer/announcements/index';

    protected array $searchable = ['subject'];

    protected array $filterable = ['status', 'audience_type'];

    protected array $exactFilters = ['status', 'audience_type'];

    protected array $sortable = ['subject', 'scheduled_at', 'created_at'];

    protected string $sortBy = 'created_at';

    protected array $activeColumns = ['id', 'subject'];

    protected function newQuery(): Builder
    {
        $batchIds = $this->assignedBatchIds();
        $userId = auth()->id();

        return parent::newQuery()->where(function (Builder $query) use ($batchIds, $userId) {
            $query->where('created_by_id', $userId)
                ->orWhere('audience_type', 'all')
                ->orWhere(function (Builder $q) use ($batchIds) {
                    $q->where('audience_type', 'batch')->whereIn('audience_batch_id', $batchIds);
                })
                ->orWhere(function (Builder $q) {
                    $q->where('audience_type', 'role')->where('audience', 'trainer');
                });
        });
    }

    protected function storeRules(): array
    {
        return [
            'subject' => ['required', 'string', 'max:255', 'unique:app_announcement,subject'],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'audience_batch_id' => ['required', 'integer', Rule::in($this->assignedBatchIds())],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'subject' => ['required', 'string', 'max:255', Rule::unique('app_announcement')->ignore($model->id)],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'audience_batch_id' => ['required', 'integer', Rule::in($this->assignedBatchIds())],
        ];
    }

    /**
     * Every trainer-authored announcement is batch-scoped; audience_type is
     * never accepted from the client here (unlike the admin controller).
     * created_by_id is only stamped on create — an edit never reassigns it.
     */
    protected function beforeSave(array $validated, ?Model $model = null): array
    {
        $validated['audience_type'] = 'batch';
        if ($model === null) {
            $validated['created_by_id'] = auth()->id();
        }

        return $validated;
    }

    /** @param Announcement $model */
    protected function afterCreate(Model $model): void
    {
        AnnouncementDispatcher::maybeDispatch($model);
    }

    /**
     * This trainer's assigned batches, for the audience picker in the
     * create/edit modal — deliberately scoped here rather than added to the
     * (not-yet-built) Trainer\Batches\BatchesController, since this is the
     * only surface in Task 3.1 that needs it.
     */
    public function batchOptions(): JsonResponse
    {
        $batches = Batches::whereIn('id', $this->assignedBatchIds())
            ->orderBy('batch_code')
            ->get(['id', 'batch_code'])
            ->map(fn(Batches $batch) => ['value' => $batch->id, 'label' => $batch->batch_code]);

        return $this->sendResponse($batches);
    }
}
