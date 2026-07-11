<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicIndustry extends Model
{
    use HasFactory;

    protected $table = 'app_settings_academic_industry';

    protected $fillable = [
        'status',
        'name',
        'description',
    ];

    public function learningOutcomes(): HasMany
    {
        return $this->hasMany(AcademicLearningOutcomes::class, 'academic_industry_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batches::class, 'academic_industry_id');
    }
}
