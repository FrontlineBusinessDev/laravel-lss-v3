<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $table = 'app_holidays';

    protected $fillable = [
        'date',
        'name',
        'country_code',
        'source',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
