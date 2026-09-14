<?php

namespace App\Jobs;

use App\Models\JobRun;
use App\Models\Task;
use App\Models\Trainees;
use App\Support\HourThresholdDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Queued replacement for the old inline loop in
 * TasksController::bulkStatusByFilter(). Fixes the two things that made the
 * synchronous version time out at Guard.php:77 under load: it no longer
 * re-resolves the Spatie policy per task-group (the caller authorizes once,
 * before dispatch — the query is already scoped to the user's assigned
 * batches, so a per-row check was redundant), and it no longer issues one
 * query per group — it chunks straight over the matched rows instead.
 *
 * Idempotent by construction: each chunk only selects rows still outside the
 * target status, and progress commits chunk-by-chunk, so if the queue worker
 * is killed mid-run (it only gets ~50s per cron tick — see
 * docs/production-email-cron-checklist.md) the next tick's re-run of this
 * same job just picks up the remaining rows.
 */
class BulkTaskStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const CHUNK_SIZE = 200;

    public int $tries = 3;

    public function __construct(
        public string $jobRunId,
        /** @var list<string> */
        public array $groupIds,
        public string $action, // 'complete' | 'lock'
    ) {}

    public function handle(): void
    {
        $jobRun = JobRun::find($this->jobRunId);
        if (! $jobRun) {
            return;
        }

        $jobRun->markRunning();

        $targetStatus = $this->action === 'complete' ? 'completed' : 'locked';
        $skipStatuses = $this->action === 'complete' ? ['locked', 'completed'] : ['locked'];
        $touchedGroups = [];

        try {
            Task::query()
                ->whereIn('task_group_id', $this->groupIds)
                ->whereNotIn('status', $skipStatuses)
                ->orderBy('id')
                ->chunkById(self::CHUNK_SIZE, function ($rows) use ($jobRun, $targetStatus, &$touchedGroups) {
                    if ($jobRun->isCancelled()) {
                        return false;
                    }

                    DB::transaction(function () use ($rows, $jobRun, $targetStatus, &$touchedGroups) {
                        foreach ($rows as $row) {
                            $row->update($targetStatus === 'completed'
                                ? ['status' => 'completed', 'completed_at' => now()]
                                : ['status' => 'locked', 'locked_at' => now()]);

                            $touchedGroups[$row->task_group_id] = true;

                            if ($targetStatus === 'completed') {
                                $trainee = Trainees::whereKey($row->trainee_id)->first();
                                if ($trainee) {
                                    HourThresholdDispatcher::maybeDispatch($trainee);
                                }
                            }
                        }

                        $jobRun->advance($rows->count());
                    });
                });

            if ($jobRun->isCancelled()) {
                return;
            }

            $jobRun->markCompleted([
                'groups_updated' => count($touchedGroups),
                'rows_updated' => JobRun::where('id', $jobRun->id)->value('processed'),
            ]);
        } catch (Throwable $e) {
            $jobRun->markFailed($e->getMessage());
            throw $e;
        }
    }
}
