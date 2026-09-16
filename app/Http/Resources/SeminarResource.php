<?php

namespace App\Http\Resources;

use App\Http\Controllers\v1\Developer\Seminar\SeminarListController;
use App\Models\Seminar;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shapes a Seminar row for paginationSearch() the same way
 * SeminarListController::mapSeminar() already shapes it for
 * store()/update()/the transition endpoints — single source of truth so the
 * table (DataTableCardField) and the mutation responses never drift.
 *
 * @mixin Seminar
 */
class SeminarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return SeminarListController::mapSeminar($this->resource);
    }
}
