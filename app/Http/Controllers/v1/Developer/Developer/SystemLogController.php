<?php

namespace App\Http\Controllers\v1\Developer\Developer;

use App\Http\Controllers\v1\BaseController;
use App\Models\AppLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    /**
     * Permanently deletes every log row in [created_at_from, created_at_to],
     * re-authenticating the developer's password first (same `current_password`
     * rule ChangePasswordController uses). No soft-deletes on AppLogger — this
     * is a hard delete by design.
     */
    public function deleteRange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'created_at_from' => ['required', 'date'],
            'created_at_to' => ['required', 'date', 'after_or_equal:created_at_from'],
        ]);

        $deleted = AppLogger::whereBetween('created_at', [
            $validated['created_at_from'] . ' 00:00:00',
            $validated['created_at_to'] . ' 23:59:59',
        ])->delete();

        return $this->sendResponse(
            ['deleted' => $deleted],
            "Deleted {$deleted} log entr" . ($deleted === 1 ? 'y.' : 'ies.'),
        );
    }
}
