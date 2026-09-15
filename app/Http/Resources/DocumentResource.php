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
            'id' => $this->id,
            'status' => $this->status,
            'trainee_id' => $this->trainee_id,
            'document_type' => $this->document_type,
            'original_name' => $this->original_name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'url_link' => $this->url_link,
            'file_size' => $this->file_size,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            ...$this->resolveUrls(),
            'trainee_name' => trim(($this->trainee?->first_name ?? '').' '.($this->trainee?->last_name ?? '')),
            'batch_code' => $this->trainee?->batch?->batch_code,
        ];
    }
}
