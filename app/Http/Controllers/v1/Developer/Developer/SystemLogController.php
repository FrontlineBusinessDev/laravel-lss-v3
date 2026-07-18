<?php

namespace App\Http\Controllers\v1\Developer\Developer;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\AppLogger;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only developer view over the audit trail. Reuses BaseController's
 * paginationSearch() for the filterable table (the full actor/changes JSON rides
 * in each row, so the detail modal needs no extra endpoint). Create / update /
 * archive / restore / destroy are intentionally NOT wired — the log is
 * append-only. Route access is gated to the `developer` role in routes/web.php.
 */
class SystemLogController extends BaseController
{
    protected string $model = AppLogger::class;

    protected string $view = 'developer/system-log/index';

    protected array $searchable = ['action', 'subject_label', 'description', 'url'];

    protected array $filterable = ['action', 'loggable_type', 'actor_id'];

    // All exact — an "action=create" filter must not also match any longer
    // value, loggable_type is a class string, and actor_id is a foreign key.
    protected array $exactFilters = ['action', 'loggable_type', 'actor_id'];

    protected array $sortable = ['id', 'action', 'created_at'];

    protected string $sortBy = 'created_at';

    /**
     * `created_at` is a range filter (created_at_from / created_at_to), which
     * BaseController::paginationSearch()'s generic filters[] loop doesn't
     * support — it only does exact/LIKE on a single value per column.
     */
    protected function newQuery(): Builder
    {
        $query = parent::newQuery();

        $filters = (array) request()->input('filters', []);
        $from = $filters['created_at_from'] ?? null;
        $to = $filters['created_at_to'] ?? null;

        if (! empty($from)) {
            $query->whereDate('created_at', '>=', $from);
        }
        if (! empty($to)) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }
}
