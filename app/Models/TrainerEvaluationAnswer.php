<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerEvaluationAnswer extends Model
{
    protected $table = 'app_trainer_evaluation_answers';

    protected $guarded = [];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(TrainerEvaluation::class, 'evaluation_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(EvaluationTrainerQuestion::class, 'question_id');
    }
}
