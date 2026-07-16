<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupDiscount extends Model
{
    protected $table = 'app_settings_group_discounts';

    protected $fillable = [
        'min_trainees',
        'discount_percentage',
    ];

    protected $casts = [
        'min_trainees' => 'integer',
        'discount_percentage' => 'decimal:2',
    ];
}
