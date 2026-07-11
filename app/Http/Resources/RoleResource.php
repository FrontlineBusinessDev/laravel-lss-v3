<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Spatie\Permission\Models\Role */
class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'permissions' => $this->permissions->pluck('name')->values(),
            'permissions_count' => $this->permissions->count(),
            // Real lifecycle status from the roles table (active/inactive), so
            // the shared table's status column and filter reflect the DB.
            'status' => $this->status,
        ];
    }
}
