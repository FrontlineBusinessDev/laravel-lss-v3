<?php

namespace App\Observers;

use App\Models\Batches;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Statuses;

/**
 * Cascades a batch's lifecycle status to every trainee under it, and — for
 * any trainee with a linked login account — mirrors the derived status onto
 * User.status too. PreventInactiveLogin blocks login by checking
 * User.status, not Trainees.status, so without this a trainee who goes
 * inactive via the cascade below would still be able to log in.
 *
 * Mapping: batch `active` -> trainee `active`; every other batch status
 * (`inactive`/`completed`/`terminated`) -> trainee `inactive`. PENDING
 * trainees (not yet approved into the batch) are left alone — they have no
 * batch-driven state to derive, and have no linked account yet anyway.
 *
 * Deliberately a separate observer from the existing billing-focused
 * TraineeObserver — this cascades Batches -> Trainees/User, not Trainees
 * itself.
 */
class BatchStatusObserver
{
    public function saved(Batches $batch): void
    {
        if (! $batch->wasChanged('status')) {
            return;
        }

        $derivedStatus = $batch->status === Statuses::ACTIVE ? Statuses::ACTIVE : Statuses::INACTIVE;

        $affectedTrainees = Trainees::where('batch_id', $batch->id)
            ->where('status', '!=', Statuses::PENDING)
            ->get(['id', 'user_id']);

        if ($affectedTrainees->isEmpty()) {
            return;
        }

        Trainees::whereIn('id', $affectedTrainees->pluck('id'))
            ->update(['status' => $derivedStatus]);

        $linkedUserIds = $affectedTrainees->pluck('user_id')->filter()->all();
        if (! empty($linkedUserIds)) {
            User::whereIn('id', $linkedUserIds)->update(['status' => $derivedStatus]);
        }
    }
}
