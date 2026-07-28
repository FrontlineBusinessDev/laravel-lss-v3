<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model; 

class AcademicProgramType extends Model
{
    protected $table = 'app_settings_academic_program_type';

    protected $fillable = [
        'status',
        'name',
    ];
 
}
