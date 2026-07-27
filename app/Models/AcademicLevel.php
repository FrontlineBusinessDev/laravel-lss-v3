<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicLevel extends Model
{
    // use HasFactory;

    protected $table = 'app_settings_academic_level';

    protected $fillable = [
        'status',
        'name',
        'description',
    ];

    public function trainees(): HasMany
    {
        return $this->hasMany(Trainees::class, 'academic_level_id');
    }
}
