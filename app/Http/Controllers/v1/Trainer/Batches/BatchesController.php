<?php

namespace App\Http\Controllers\v1\Trainer\Batches;

use App\Http\Controllers\v1\BaseController;
use App\Models\Batches;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;

/**
 * Trainer-facing Batches: read-only, scoped to this trainer's assigned
 * batches only (see ScopesToAssignedBatches). No store/update/archive/
 * destroy — a trainer never mutates a batch, so those BaseController actions
 * are simply never routed to for this controller.
 */
class BatchesController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Batches::class;

    protected string $view = 'trainer/batches/index';

    protected array $searchable = ['batch_code'];

    protected array $filterable = [
        'status',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];

    protected array $exactFilters = [
        'status',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];

    protected array $sortable = ['id', 'batch_code', 'date_started', 'created_at'];

    protected string $sortBy = 'batch_code';

    /** Batches has no `name` column — BaseController's lookup()/searchActive() default is wrong for this model. */
    protected array $activeColumns = ['id', 'batch_code'];

    protected function newQuery(): Builder
    {
        return parent::newQuery()
            ->with([
                'academicIndustry:id,name',
                'academicLevel:id,name',
                'academicProgram:id,name',
            ])
            ->withCount('trainees')
            ->whereIn('id', $this->assignedBatchIds());
    }
}
