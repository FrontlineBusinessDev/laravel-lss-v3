<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $table = 'app_settings_payment_methods';

    protected $fillable = [
        'status',
        'provider_name',
        'type',
        'logo',
        'qr_code',
        'account_name',
        'account_number',
        'payment_link',
        'instructions',
        'display_order',
    ];
}
