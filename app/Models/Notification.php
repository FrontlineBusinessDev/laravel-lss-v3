<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * In-app notification feed, polled by the TopBar/NotificationBell (no
 * broadcasting infra in this app). Deliberately a plain app-owned table
 * (`app_*` convention) rather than Laravel's built-in database notifications,
 * to stay consistent with how every other module is modeled here.
 */
class Notification extends Model
{
    protected $table = 'app_notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
