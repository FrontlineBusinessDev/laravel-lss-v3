<?php

namespace App\Http\Resources;

use App\Models\TraineeDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin TraineeDocument */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->toArray(),
            ...$this->resolveUrls(),
            'trainee_name' => trim(($this->trainee?->first_name ?? '').' '.($this->trainee?->last_name ?? '')),
            'batch_code' => $this->trainee?->batch?->batch_code,
        ];
    }
}
