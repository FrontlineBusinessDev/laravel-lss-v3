<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnouncementRead extends Model
{
    protected $table = 'app_announcement_reads';

    protected $guarded = [];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function announcement(): BelongsTo
    {
        return $this->belongsTo(Announcement::class);
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class);
    }
}
