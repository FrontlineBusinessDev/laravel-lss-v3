<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    /** Approved leaves whose range covers the given date. */
    public function scopeApprovedCovering(Builder $query, string $date): Builder
    {
        return $query->where('status', 'approved')
            ->whereDate('leave_date', '<=', $date)
            ->whereDate('return_date', '>=', $date);
    }
}
