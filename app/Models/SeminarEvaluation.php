<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeminarEvaluation extends Model
{
    protected $table = 'app_seminar_evaluations';

    protected $guarded = [];

    protected $casts = [
        'total_score' => 'float',
        'submitted_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class, 'seminar_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(SeminarParticipant::class, 'participant_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SeminarEvaluationAnswer::class, 'evaluation_id');
    }
}
