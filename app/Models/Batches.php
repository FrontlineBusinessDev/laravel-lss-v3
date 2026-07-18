<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batches extends Model
{
    use HasFactory;

    protected $table = 'app_batches';

    protected $fillable = [
        'status',
        'batch_code',
        'public_registration_url_id',
        'is_public_url_enable',
        'date_started',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];

    protected $casts = [
        'date_started' => 'date',
        'is_public_url_enable' => 'boolean',
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
        return $this->hasMany(Trainees::class, 'batch_id');
    }

    public function trainers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'app_batch_trainer', 'batch_id', 'trainer_id');
    }
}
