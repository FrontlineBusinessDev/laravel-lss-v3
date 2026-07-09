<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicLevel extends Model
{
    use HasFactory;

    protected $table = 'app_settings_academic_level';

    protected $fillable = [
        'name',
        'year_level',
        'description',
    ];

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'academic_level_id');
    }
}
