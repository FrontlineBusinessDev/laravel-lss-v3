<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicProgramType extends Model
{
    protected $table = 'app_settings_academic_program_type';

    protected $fillable = [
        'status',
        'name',
    ];

    public function trainees(): HasMany
    {
        return $this->hasMany(Trainees::class, 'academic_program_type_id');
    }
}
