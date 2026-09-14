<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeminarEmailTemplate extends Model
{
    protected $table = 'app_seminar_email_templates';

    protected $fillable = [
        'key',
        'name',
        'trigger_description',
        'subject',
        'body',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];
}
