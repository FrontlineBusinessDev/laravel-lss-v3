<?php

namespace App\Support;

use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\TraineeDocument;
use App\Models\Trainees;
use Illuminate\Support\Facades\Storage;

/**
 * Hard-deletes a trainee and everything under it. Shared by TraineesController
 * (single trainee) and BatchesController (cascading through every trainee in
 * a deleted batch) so the cleanup order lives in exactly one place.
 *
 * Payments, the certificate, and the learning-outcomes pivot all cascade at
 * the DB level already (cascadeOnDelete FKs), so they're left to Trainees'
 * own delete(). Documents, tasks, leave requests, and task ratings are all
 * restrictOnDelete FKs and must be removed here first, before the trainee row
 * itself, or the DB will reject the delete.
 */
class TraineeCascadeDeleter
{
    public static function delete(Trainees $trainee): void
    {
        $disk = config('filesystems.default');

        /** @var TraineeDocument $document */
        foreach ($trainee->documents as $document) {
            if ($document->file_path) {
                Storage::disk($disk)->delete($document->file_path);
            }
        }
        $trainee->documents()->delete();

        if ($trainee->avatar_path) {
            Storage::disk($disk)->delete($trainee->avatar_path);
        }

        Task::where('trainee_id', $trainee->id)->delete();
        LeaveRequest::where('trainee_id', $trainee->id)->delete();
        // TaskRatingHistory rows cascade at the DB level off app_task_ratings.
        TaskRating::where('trainee_id', $trainee->id)->delete();

        // payments/certificate/learningOutcomes cascade via DB FKs.
        $trainee->delete();
    }
}
