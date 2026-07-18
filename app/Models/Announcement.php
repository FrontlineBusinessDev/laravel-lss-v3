<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'app_announcement';

    protected $fillable = [
        'status',
        'subject',
        'description',
        'audience',
        'scheduled_at',
        'notified_at',
        'audience_type',
        'audience_batch_id',
        'audience_user_ids',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'notified_at' => 'datetime',
        'audience_user_ids' => 'array',
    ];
}
