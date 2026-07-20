<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainerEvaluation extends Model
{
    protected $table = 'app_trainer_evaluations';

    protected $guarded = [];

    protected $casts = [
        'total_score' => 'float',
        'submitted_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TrainerEvaluationAnswer::class, 'evaluation_id');
    }
}
