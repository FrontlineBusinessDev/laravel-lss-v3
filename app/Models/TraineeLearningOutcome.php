<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class TraineeLearningOutcome extends Pivot
{
    use HasFactory;

    protected $table = 'app_trainees_learning_outcomes';

    public $incrementing = true;

    protected $fillable = [
        'trainee_id',
        'learning_outcome_id',
        'status',
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function learningOutcome(): BelongsTo
    {
        return $this->belongsTo(AcademicLearningOutcomes::class, 'learning_outcome_id');
    }
}
