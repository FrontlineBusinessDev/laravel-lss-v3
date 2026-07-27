<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicProgram extends Model
{
    // use HasFactory;

    protected $table = 'app_settings_academic_program';

    protected $fillable = [
        'status',
        'name',
    ];

    public function learningOutcomes(): HasMany
    {
        return $this->hasMany(AcademicLearningOutcomes::class, 'academic_program_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batches::class, 'academic_program_id');
    }
}
