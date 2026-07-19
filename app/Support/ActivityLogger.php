<?php

namespace App\Support;

use App\Models\AppLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

/**
 * Central writer for the app_loggers audit trail. Every capture path — the model
 * observer (create/update/delete/archive/restore) and the visit middleware —
 * funnels through here so actor snapshotting, subject labelling and request
 * context live in one place.
 *
 * Auditing must never break the action it records, so each write is wrapped in a
 * try/catch: a failed audit write is reported and swallowed.
 */
class ActivityLogger
{
    /** @var list<string> */
    public const ACTIONS = ['create', 'update', 'delete', 'archive', 'restore', 'visit', 'error'];

    /**
     * @param  array<string, mixed>  $changes
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        array $changes = [],
        ?string $description = null,
    ): void {
        // Never audit the audit table itself.
        if ($subject instanceof AppLogger) {
            return;
        }

        try {
            AppLogger::create([
                'action' => $action,
                'loggable_type' => $subject ? $subject::class : null,
                'loggable_id' => $subject?->getKey(),
                'subject_label' => $subject ? self::labelFor($subject) : null,
                'actor_id' => Auth::id(),
                'actor' => self::actorSnapshot(),
                'changes' => $changes !== [] ? $changes : null,
                'description' => $description ?? self::describe($action, $subject),
                'ip_address' => self::requestValue(fn () => Request::ip()),
                'user_agent' => self::requestValue(fn () => Request::userAgent()),
                'url' => self::requestValue(fn () => Request::fullUrl()),
                'method' => self::requestValue(fn () => Request::method()),
            ]);
        } catch (\Throwable $e) {
            Log::warning('ActivityLogger failed to write audit entry', [
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Captures an uncaught exception as an 'error' row, with actor + stack trace. */
    public static function logError(\Throwable $e): void
    {
        self::log('error', null, [
            'exception' => $e::class,
            'trace' => $e->getTraceAsString(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], $e->getMessage());
    }

    /**
     * Disconnected snapshot of the acting user (never a foreign key).
     *
     * @return array<string, mixed>|null
     */
    private static function actorSnapshot(): ?array
    {
        $user = Auth::user();
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->getAttribute('id'),
            'first_name' => $user->getAttribute('first_name'),
            'last_name' => $user->getAttribute('last_name'),
            'email' => $user->getAttribute('email'),
        ];
    }

    /** Best-effort human label for the subject row (batch_code / name / #id). */
    private static function labelFor(Model $subject): string
    {
        foreach (['batch_code', 'name', 'title', 'email', 'school_name'] as $attr) {
            $value = $subject->getAttribute($attr);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return class_basename($subject).' #'.$subject->getKey();
    }

    private static function describe(string $action, ?Model $subject): string
    {
        if ($subject === null) {
            return ucfirst($action);
        }

        return ucfirst($action).' '.class_basename($subject).' '.self::labelFor($subject);
    }

    /** Guard request accessors so console/queue contexts don't record noise. */
    private static function requestValue(callable $get): ?string
    {
        if (app()->runningInConsole() || ! app()->bound('request')) {
            return null;
        }

        $value = $get();

        return $value === null ? null : (string) $value;
    }
}
