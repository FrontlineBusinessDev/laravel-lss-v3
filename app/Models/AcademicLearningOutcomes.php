<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicLearningOutcomes extends Model
{
    use HasFactory;

    protected $table = 'app_settings_academic_learning_outcomes';

    protected $fillable = [
        'learning_outcomes',
        'academic_industry_id',
        'academic_program_id',
    ];

    public function academicIndustry(): BelongsTo
    {
        return $this->belongsTo(AcademicIndustry::class, 'academic_industry_id');
    }

    public function academicProgram(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'academic_program_id');
    }
}
