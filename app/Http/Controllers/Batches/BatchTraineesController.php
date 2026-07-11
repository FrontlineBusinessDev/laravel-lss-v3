<?php

namespace App\Http\Controllers\Batches;

use App\Http\Controllers\BaseController;
use App\Models\Trainee;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only, batch-scoped trainee listing that backs the batch detail page's
 * DataTableField (GET /batches/{batch}/trainees/pagination-search). Reuses the
 * BaseController listing pipeline (search / filter / sort / paginate); the only
 * customization is scoping every query to the batch id from the route.
 */
class BatchTraineesController extends BaseController
{
    protected string $model = Trainee::class;

    protected array $searchable = ['first_name', 'last_name', 'email'];

    protected array $filterable = ['status'];

    protected array $sortable = ['first_name', 'last_name', 'required_hours', 'status', 'created_at'];

    protected string $sortBy = 'first_name';

    /** Scope to the {batch} route segment and eager-load the school name cell. */
    protected function newQuery(): Builder
    {
        $batchId = request()->route('batch');

        return Trainee::query()
            ->with('school:id,school_name')
            ->where('batch_id', $batchId);
    }
}
