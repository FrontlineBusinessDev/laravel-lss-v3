<?php

namespace App\Support;

use App\Models\Trainees;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The same person can legitimately have multiple app_trainees rows over time
 * (re-enrolling under a new batch) — email is no longer unique at the DB
 * level. This is the single place that: (1) keeps every row's
 * `previous_trainee_id` pointer in sync with actual `created_at` order,
 * regardless of the order the rows were created/imported in, and (2)
 * auto-supersedes older rows to `inactive` once a newer enrollment exists.
 *
 * Hooked into TraineeObserver so every creation path (CSV import, admin
 * create, public self-registration, status-changing calls like approve()) is
 * covered from one place instead of being duplicated per controller.
 */
class TraineeEnrollmentLinker
{
    private const ACTIVE_LIKE = [Statuses::ACTIVE, Statuses::PENDING];

    /**
     * Re-derives previous_trainee_id for every row sharing this trainee's
     * email, ordered by created_at, then moves the shared login to whichever
     * row is now the current one. Call from TraineeObserver::saved() on
     * create or when email/status changed.
     */
    public static function relinkChain(Trainees $trainee): void
    {
        DB::transaction(function () use ($trainee) {
            $siblings = Trainees::whereRaw('LOWER(email) = ?', [mb_strtolower(trim($trainee->email))])
                ->lockForUpdate()
                ->orderBy('created_at')
                ->orderBy('id')
                ->get();

            if ($siblings->count() < 2) {
                return;
            }

            foreach ($siblings as $i => $row) {
                $expectedPrevious = $i > 0 ? $siblings[$i - 1]->id : null;
                if ($row->previous_trainee_id !== $expectedPrevious) {
                    $row->previous_trainee_id = $expectedPrevious;
                    $row->timestamps = false;
                    $row->saveQuietly();
                }
            }

            $head = self::resolveHead($siblings);

            foreach ($siblings as $row) {
                if ($row->id === $head->id) {
                    continue;
                }

                if (in_array($row->status, self::ACTIVE_LIKE, true)) {
                    $row->status = Statuses::INACTIVE;
                    $row->timestamps = false;
                    $row->saveQuietly();
                }
            }

            TraineeAccountLinker::moveToHead($head, $siblings);
        });
    }

    /**
     * The "current" enrollment for login-routing and import-matching
     * purposes: always the most recently created row, regardless of status —
     * a new enrollment supersedes any older one even if that older row's
     * status was never updated.
     *
     * @param  Collection<int, Trainees>  $siblings  Ordered oldest-first (see enrollmentChain()/relinkChain()).
     */
    public static function resolveHead(Collection $siblings): Trainees
    {
        return $siblings->last();
    }
}
