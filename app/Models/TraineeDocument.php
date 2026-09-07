<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TraineeDocument extends Model
{
    use HasFactory;

    protected $table = 'app_trainees_documents';

    protected $fillable = [
        'status',
        'trainee_id',
        'document_type',
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'url_link',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the trainee that owns this document.
     */
    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    /**
     * Presigned view/download URL for a stored upload, or the raw link for a
     * `url_link`-only row. Shared by every controller that serializes a
     * document (developer/trainer trainee-document tabs, the documents
     * master list) so the derivation lives in exactly one place.
     *
     * @return array{view_url: ?string, download_url: ?string, file_missing: bool}
     */
    public function resolveUrls(): array
    {
        $disk = config('filesystems.default');
        $url = null;
        $fileMissing = false;

        if ($this->file_path) {
            if (Storage::disk($disk)->exists($this->file_path)) {
                try {
                    $url = Storage::temporaryUrl($this->file_path, now()->addMinutes(60));
                } catch (\RuntimeException $e) {
                    $url = Storage::url($this->file_path);
                }
            } else {
                $fileMissing = true;
            }
        }

        return [
            'view_url' => $url ?? $this->url_link,
            'download_url' => $url ?? $this->url_link,
            'file_missing' => $fileMissing,
        ];
    }
}
