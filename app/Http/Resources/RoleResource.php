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
            // Roles have no lifecycle; surface a constant so the shared table's
            // status column renders consistently.
            'status' => 'active',
        ];
    }
}
