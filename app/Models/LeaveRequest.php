<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Minimal leave record, scoped only to what the Daily Task Sheet's
 * approved-leave check needs. Not the full /leave module.
 */
class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'app_leave_requests';

    protected $guarded = [];

    protected $casts = [
        'leave_date' => 'date',
        'return_date' => 'date',
        'decided_at' => 'datetime',
    ];

    protected $appends = ['document_view_url', 'document_download_url'];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function leaveCategory(): BelongsTo
    {
        return $this->belongsTo(LeaveCategory::class, 'leave_category_id');
    }

    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by_id');
    }

    public function getDocumentViewUrlAttribute(): ?string
    {
        return $this->resolveDocumentUrl();
    }

    public function getDocumentDownloadUrlAttribute(): ?string
    {
        return $this->resolveDocumentUrl();
    }

    private function resolveDocumentUrl(): ?string
    {
        if (! $this->document_path) {
            return null;
        }

        try {
            return Storage::temporaryUrl($this->document_path, now()->addMinutes(60));
        } catch (\RuntimeException $e) {
            return Storage::url($this->document_path);
        }
    }

    /** Approved leaves whose range covers the given date. */
    public function scopeApprovedCovering(Builder $query, string $date): Builder
    {
        return $query->where('status', 'approved')
            ->whereDate('leave_date', '<=', $date)
            ->whereDate('return_date', '>=', $date);
    }
}
