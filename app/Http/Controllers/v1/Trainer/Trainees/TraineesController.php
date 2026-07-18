<?php

namespace App\Http\Controllers\v1\Trainer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\Trainees;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;

/**
 * Trainer-facing Trainees: read-only, scoped to trainees in this trainer's
 * assigned batches only. No store/update/archive/destroy — trainer-side
 * mutation happens on Documents/Learning Outcomes only (TraineesViewController),
 * never the trainee record itself.
 */
class TraineesController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Trainees::class;

    protected string $view = 'trainer/trainees/index';

    protected array $searchable = ['first_name', 'last_name', 'email'];

    protected array $filterable = ['status', 'batch_id', 'school_id'];

    protected array $exactFilters = ['status', 'batch_id', 'school_id'];

    protected array $sortable = ['status', 'id', 'last_name', 'required_hours'];

    protected string $sortBy = 'last_name';

    /** Trainees has no `name` column — BaseController's lookup() default is wrong for this model. */
    protected array $activeColumns = ['id', 'first_name', 'last_name'];

    /**
     * academic_industry_id/academic_level_id/academic_program_id live on the
     * batch, not app_trainees, so they can't ride BaseController's generic
     * flat-column filter loop — applied here via whereHas('batch', ...) instead.
     */
    protected function newQuery(): Builder
    {
        $query = parent::newQuery()
            ->with([
                'school:id,school_name',
                'batch:id,batch_code,academic_industry_id,academic_program_id,academic_level_id',
                'batch.academicIndustry:id,name',
                'batch.academicProgram:id,name,course_name',
                'batch.academicLevel:id,name,year_level',
            ])
            ->whereIn('batch_id', $this->assignedBatchIds());

        foreach (['academic_industry_id', 'academic_level_id', 'academic_program_id'] as $batchFilter) {
            $value = request()->input("filters.{$batchFilter}");
            if ($value !== null && $value !== '') {
                $query->whereHas('batch', fn(Builder $q) => $q->where($batchFilter, $value));
            }
        }

        return $query;
    }
}
