<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Tracks one dispatched queued job's progress for the frontend's reusable
 * progress-toast system (see AsyncOperations.tsx / useAsyncJobs()) to poll —
 * `status` moves queued -> running -> completed|failed|cancelled, `processed`
 * advances as the job works through chunks. `cancelled` is set by the user via
 * the cancel endpoint and must be checked between chunks by the job itself.
 */
class JobRun extends Model
{
    use HasUuids;

    protected $table = 'app_job_runs';

    protected $fillable = [
        'id',
        'type',
        'status',
        'total',
        'processed',
        'payload',
        'result',
        'error',
        'user_id',
    ];

    protected $casts = [
        'payload' => 'array',
        'result' => 'array',
        'total' => 'integer',
        'processed' => 'integer',
    ];

    public function markRunning(): void
    {
        if ($this->status === 'queued') {
            $this->update(['status' => 'running']);
        }
    }

    public function isCancelled(): bool
    {
        return static::where('id', $this->id)->value('status') === 'cancelled';
    }

    public function advance(int $by): void
    {
        $this->increment('processed', $by);
    }

    public function markCompleted(array $result): void
    {
        $this->update(['status' => 'completed', 'result' => $result]);
    }

    public function markFailed(string $error): void
    {
        $this->update(['status' => 'failed', 'error' => $error]);
    }
}
