<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $table = 'app_tasks';

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'completed_at' => 'datetime',
        'locked_at' => 'datetime',
        'time_goal' => 'decimal:2',
        'time_spent' => 'decimal:2',
        'is_running' => 'boolean',
        'started_at' => 'datetime',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batches::class, 'batch_id');
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainees::class, 'trainee_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
