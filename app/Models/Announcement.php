<?php

namespace App\Models;

use App\Support\Statuses;
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

    /**
     * Announcements a trainee can see: active, unscheduled-or-due, and
     * targeted at `all`, their batch, the `trainee` role, or them by name.
     * Mirrors TraineeDashboardController::buildAnnouncements()'s where-clause
     * (kept here so the full Announcements page and the dashboard widget's
     * eventual refactor share one source of truth) and scopeVisibleToTrainer().
     */
    public function scopeVisibleToTrainee(Builder $query, int $traineeId, ?int $batchId): Builder
    {
        return $query
            ->where('status', Statuses::ACTIVE)
            ->where(function (Builder $q) use ($traineeId, $batchId) {
                $q->where('audience_type', 'all')
                    ->orWhere(function (Builder $q2) use ($batchId) {
                        $q2->where('audience_type', 'batch')->where('audience_batch_id', $batchId);
                    })
                    ->orWhere(function (Builder $q2) {
                        $q2->where('audience_type', 'role')->where('audience', 'trainee');
                    })
                    ->orWhere(function (Builder $q2) use ($traineeId) {
                        $q2->where('audience_type', 'custom')->whereJsonContains('audience_user_ids', $traineeId);
                    });
            })
            ->where(function (Builder $q) {
                $q->whereNull('scheduled_at')->orWhere('scheduled_at', '<=', now());
            });
    }

    protected $casts = [
        'scheduled_at' => 'datetime',
        'notified_at' => 'datetime',
        'audience_user_ids' => 'array',
    ];
}
