<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    use HasFactory;

    protected $table = 'app_batches';

    protected $fillable = [
        'status',
        'batch_code',
        'public_url_id',
        'date_started',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
        // 'status', // Uncomment if you add a status column to your migration
    ];

    protected $casts = [
        'date_started' => 'date',
    ];

    public function academicIndustry(): BelongsTo
    {
        return $this->belongsTo(AcademicIndustry::class, 'academic_industry_id');
    }

    public function academicLevel(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class, 'academic_level_id');
    }

    public function academicProgram(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'academic_program_id');
    }

    public function trainees(): HasMany
    {
        return $this->hasMany(Trainee::class, 'batch_id');
    }
}
