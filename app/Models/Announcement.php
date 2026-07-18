<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'app_announcement';

    protected $fillable = [
        'created_by_id',
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

    /** Null for admin/developer-authored (or pre-dating this column). */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    protected $casts = [
        'scheduled_at' => 'datetime',
        'notified_at' => 'datetime',
        'audience_user_ids' => 'array',
    ];
}
