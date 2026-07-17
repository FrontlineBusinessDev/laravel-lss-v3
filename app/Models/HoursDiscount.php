<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoursDiscount extends Model
{
    protected $table = 'app_settings_hours_discounts';

    protected $fillable = [
        'min_hours',
        'discount_percentage',
    ];

    protected $casts = [
        'min_hours' => 'integer',
        'discount_percentage' => 'decimal:2',
    ];
}
