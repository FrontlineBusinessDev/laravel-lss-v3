<?php

namespace App\Http\Controllers\v1\Concerns;

use App\Models\Trainees;
use Illuminate\Database\Eloquent\Builder;

/**
 * Dedupes the "resolve the App\Models\Trainees row for the authenticated
 * user" lookup copy-pasted across every trainee self-service controller
 * (Ratings, Tasks, MyInfo, Payments, Biometrics, Announcements, Dashboard,
 * Evaluations) — each of them scopes its queries to that row's id.
 */
trait ScopedToCurrentTrainee
{
    /**
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    protected function currentTrainee(): Trainees
    {
        return $this->currentTraineeQuery()->firstOrFail();
    }

    /**
     * Override in a child controller to layer extra scopes (e.g.
     * withCompletedHours()) onto the base lookup before firstOrFail().
     *
     * @return Builder<Trainees>
     */
    protected function currentTraineeQuery(): Builder
    {
        return Trainees::where('user_id', auth()->id());
    }
}
