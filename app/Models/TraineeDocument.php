<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
