<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\BaseController;
use App\Models\AppLogger;

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

    protected array $filterable = ['action', 'loggable_type'];

    // Both filters are exact — an "action=create" filter must not also match
    // any longer value, and loggable_type is a class string.
    protected array $exactFilters = ['action', 'loggable_type'];

    protected array $sortable = ['id', 'action', 'created_at'];

    protected string $sortBy = 'created_at';
}
