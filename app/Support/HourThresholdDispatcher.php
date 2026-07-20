<?php

namespace App\Support;

use App\Mail\TrainerEvaluationDueMail;
use App\Models\Notification;
use App\Models\Trainees;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Fires once, the moment a trainee's completed task hours meet/exceed their
 * required_hours: an in-app Notification + queued email (mirroring
 * AnnouncementDispatcher), plus a Google Chat webhook leg. Idempotent via
 * `hour_threshold_notified_at` — call from any task-completion endpoint.
 */
class HourThresholdDispatcher
{
    public static function maybeDispatch(Trainees $trainee): void
    {
        if ($trainee->hour_threshold_notified_at !== null) {
            return;
        }
        if ($trainee->user_id === null) {
            return;
        }

        $completedHours = (float) $trainee->tasks()->where('status', 'completed')->sum('time_spent');
        if ($completedHours < (float) $trainee->required_hours) {
            return;
        }

        Notification::create([
            'user_id' => $trainee->user_id,
            'type' => 'evaluation.hours_met',
            'title' => 'Trainer evaluation now due',
            'body' => 'You\'ve met your required hours — please accomplish your Trainer Evaluation form.',
            'data' => ['trainee_id' => $trainee->id],
        ]);

        try {
            Mail::to($trainee->email)->queue(new TrainerEvaluationDueMail($trainee));
        } catch (Throwable $e) {
            Log::error('trainer evaluation due mail failed', [
                'trainee_id' => $trainee->id,
                'message' => $e->getMessage(),
            ]);
        }

        GoogleChatAlert::send(sprintf(
            '%s %s has met their required hours and must accomplish their pending Trainer Evaluation form.',
            $trainee->first_name,
            $trainee->last_name,
        ));

        $trainee->update(['hour_threshold_notified_at' => now()]);
    }
}
