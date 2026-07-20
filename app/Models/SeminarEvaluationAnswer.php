<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeminarEvaluationAnswer extends Model
{
    protected $table = 'app_seminar_evaluation_answers';

    protected $guarded = [];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(SeminarEvaluation::class, 'evaluation_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(EvaluationSeminarQuestion::class, 'question_id');
    }
}
