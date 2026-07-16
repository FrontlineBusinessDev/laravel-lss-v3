<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rate extends Model
{
    protected $table = 'app_settings_rates';

    protected $fillable = [
        'setup',
        'rate_per_hour',
    ];

    protected $casts = [
        'rate_per_hour' => 'decimal:2',
    ];
}
