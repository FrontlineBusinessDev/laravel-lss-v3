<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationSeminarQuestion extends Model
{
    use HasFactory;

    protected $table = 'app_evaluation_seminar_questions';

    protected $guarded = [];

    protected $casts = [
        'is_critical' => 'boolean',
        'order' => 'integer',
    ];

    public function answers(): HasMany
    {
        return $this->hasMany(SeminarEvaluationAnswer::class, 'question_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
