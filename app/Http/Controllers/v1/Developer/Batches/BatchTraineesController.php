<?php

namespace App\Http\Controllers\v1\Developer\Batches;

use App\Http\Controllers\v1\BaseController;
use App\Models\Trainees;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only, batch-scoped trainee listing that backs the batch detail page's
 * DataTableField (GET /batches/{batch}/trainees/pagination-search). Reuses the
 * BaseController listing pipeline (search / filter / sort / paginate); the only
 * customization is scoping every query to the batch id from the route.
 */
class BatchTraineesController extends BaseController
{
    protected string $model = Trainees::class;

    protected array $searchable = ['first_name', 'last_name', 'email'];

    protected array $filterable = ['status'];

    protected array $sortable = ['first_name', 'last_name', 'required_hours', 'status', 'created_at'];

    protected string $sortBy = 'first_name';

    /**
     * Scope to the {batch} route segment, eager-load the school name cell,
     * hide archived (inactive) trainees by default (an explicit `status`
     * filter, e.g. "Archived", opts back in), and always push terminated
     * trainees to the bottom regardless of the chosen sort column.
     */
    protected function newQuery(): Builder
    {
        $batchId = request()->route('batch');
        $statusFilter = (string) request()->input('filters.status', '');

        return Trainees::query()
            ->with('school:id,school_name')
            ->where('batch_id', $batchId)
            // ->when(
            //     $statusFilter === '',
            //     fn(Builder $q) => $q->where('status', '!=', Statuses::INACTIVE),
            // )
            ->orderByRaw('CASE WHEN status = ? THEN 1 ELSE 0 END', [Statuses::TERMINATED]);
    }
}
