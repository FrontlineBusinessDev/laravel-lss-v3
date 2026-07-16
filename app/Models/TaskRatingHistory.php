<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Append-only audit trail row — one per rating save, immutable. */
class TaskRatingHistory extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $table = 'app_task_rating_history';

    protected $guarded = [];

    protected $casts = [
        'rated_at' => 'date',
    ];

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
