<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskRating extends Model
{
    use HasFactory;

    protected $table = 'app_task_ratings';

    protected $guarded = [];

    protected $casts = [
        'rated_at' => 'date',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(TaskRatingHistory::class)->latest('created_at');
    }
}
