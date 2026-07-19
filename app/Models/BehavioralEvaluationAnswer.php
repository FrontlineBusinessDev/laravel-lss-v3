<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BehavioralEvaluationAnswer extends Model
{
    use HasFactory;

    protected $table = 'app_behavioral_evaluation_answers';

    protected $guarded = [];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(BehavioralEvaluation::class, 'evaluation_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(BehavioralQuestion::class, 'question_id');
    }
}
