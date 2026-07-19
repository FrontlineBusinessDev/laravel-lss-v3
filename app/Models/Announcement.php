<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'app_announcement';

    protected $fillable = [
        'created_by_id',
        'status',
        'subject',
        'description',
        'audience',
        'scheduled_at',
        'notified_at',
        'audience_type',
        'audience_batch_id',
        'audience_user_ids',
    ];

    /** Null for admin/developer-authored (or pre-dating this column). */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Announcements a trainer can see: ones they authored, broadcasts to
     * `all`, broadcasts to the `trainer` role, or `batch`-targeted posts
     * aimed at one of their assigned batches. Shared by the trainer
     * Announcements list and the trainer Dashboard's feed widget.
     *
     * @param list<int> $batchIds
     */
    public function scopeVisibleToTrainer(Builder $query, int $userId, array $batchIds): Builder
    {
        return $query->where(function (Builder $q) use ($userId, $batchIds) {
            $q->where('created_by_id', $userId)
                ->orWhere('audience_type', 'all')
                ->orWhere(function (Builder $q2) use ($batchIds) {
                    $q2->where('audience_type', 'batch')->whereIn('audience_batch_id', $batchIds);
                })
                ->orWhere(function (Builder $q2) {
                    $q2->where('audience_type', 'role')->where('audience', 'trainer');
                });
        });
    }

    protected $casts = [
        'scheduled_at' => 'datetime',
        'notified_at' => 'datetime',
        'audience_user_ids' => 'array',
    ];
}
