<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Append-only audit record. The subject (loggable_*) and actor are stored as
 * plain columns + JSON snapshots rather than foreign keys, so a log entry
 * survives deletion of the user or record it describes (see the migration and
 * App\Support\ActivityLogger).
 *
 * @property int $id
 * @property string $action
 * @property string|null $loggable_type
 * @property int|null $loggable_id
 * @property string|null $subject_label
 * @property int|null $actor_id
 * @property array<string,mixed>|null $actor
 * @property array<string,mixed>|null $changes
 * @property string|null $description
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property string|null $url
 * @property string|null $method
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class AppLogger extends Model
{
    protected $table = 'app_loggers';

    protected $fillable = [
        'action',
        'loggable_type',
        'loggable_id',
        'subject_label',
        'actor_id',
        'actor',
        'changes',
        'description',
        'ip_address',
        'user_agent',
        'url',
        'method',
    ];

    protected $casts = [
        'actor' => 'array',
        'changes' => 'array',
    ];
}
