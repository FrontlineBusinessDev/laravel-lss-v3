<?php

namespace App\Http\Controllers\v1\Trainer\Batches;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Trainees;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only, batch-scoped trainee listing backing the trainer batch detail
 * page (GET /trainer/batches/{batch}/trainees/pagination-search). Mirrors
 * the admin BatchTraineesController, plus an assertBatchAssigned() guard —
 * paginationSearch() has no authorize() hook to override, so the guard runs
 * inside newQuery() itself and 403s before any row leaves the DB.
 */
class BatchTraineesController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Trainees::class;

    protected array $searchable = ['first_name', 'last_name', 'email'];

    protected array $filterable = ['status'];

    protected array $sortable = ['first_name', 'last_name', 'required_hours', 'status', 'created_at'];

    protected string $sortBy = 'first_name';

    protected function newQuery(): Builder
    {
        $batchId = request()->route('batch');
        $this->assertBatchAssigned($batchId);

        return Trainees::query()
            ->with('school:id,school_name')
            ->where('batch_id', $batchId);
    }
}
