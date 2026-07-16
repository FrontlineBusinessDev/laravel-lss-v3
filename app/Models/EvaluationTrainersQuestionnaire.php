<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationTrainersQuestionnaire extends Model
{
    use HasFactory;

    protected $table = 'app_evaluation_trainers_questionnaire';

    protected $fillable = [
        'status',
        'question',
        'answer_type',
        'section',
        'mark_as_critical',
        'category',
        'added_by',
    ];
}
