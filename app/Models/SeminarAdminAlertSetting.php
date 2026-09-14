<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeminarAdminAlertSetting extends Model
{
    protected $table = 'app_seminar_admin_alert_settings';

    protected $fillable = [
        'key',
        'label',
        'description',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];
}
