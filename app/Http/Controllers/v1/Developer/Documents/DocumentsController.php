<?php

namespace App\Http\Controllers\v1\Developer\Documents;

use App\Http\Controllers\v1\BaseController;
use App\Http\Resources\DocumentResource;
use App\Models\TraineeDocument;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only master list of every trainee document, across every trainee, for
 * admin/developer. Reuses BaseController's paginationSearch() the same way
 * SystemLogController does — no create/update/archive/restore/destroy are
 * wired since uploads/deletes stay scoped to a trainee's own Documents tab
 * (Developer\Trainees\TraineeDocumentsController, Trainer\Trainees\TraineeDocumentsController).
 * Route access is gated to `role:admin|developer` in routes/web.php.
 */
class DocumentsController extends BaseController
{
    protected string $model = TraineeDocument::class;

    protected string $view = 'developer/documents/index';

    protected ?string $resource = DocumentResource::class;

    protected array $searchable = ['original_name', 'document_type'];

    protected array $filterable = ['document_type', 'status', 'trainee_id'];

    protected array $exactFilters = ['status', 'trainee_id'];

    protected array $sortable = ['id', 'document_type', 'created_at'];

    protected string $sortBy = 'created_at';

    protected function newQuery(): Builder
    {
        return parent::newQuery()->with(['trainee', 'trainee.batch']);
    }
}
