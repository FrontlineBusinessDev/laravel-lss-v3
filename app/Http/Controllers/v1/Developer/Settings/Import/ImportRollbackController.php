<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\SettingsImportLog;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/**
 * Lists recent Settings > Import runs and rolls one back by deleting exactly
 * the records it created (tracked in SettingsImportLog::created_ids, see
 * ImportLogging::finishImport()), in reverse creation order. Rows that only
 * matched/updated a pre-existing record were never tracked and are left
 * alone — rollback only ever undoes genuinely-new data.
 */
class ImportRollbackController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** GET /settings/import/logs */
    public function index(): JsonResponse
    {
        $logs = SettingsImportLog::with(['importedBy:id,first_name,last_name,email', 'rolledBackBy:id,first_name,last_name,email'])
            ->latest()
            ->limit(50)
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }

    /** POST /settings/import/logs/{log}/rollback */
    public function rollback(SettingsImportLog $log): JsonResponse
    {
        abort_if($log->rolled_back_at !== null, 422, 'This import has already been rolled back.');

        $errors = [];
        $remaining = [];
        $deletedCount = 0;

        foreach (array_reverse($log->created_ids ?? []) as $entry) {
            $model = $entry['model'] ?? null;

            if ($model !== 'pivot:trainee_learning_outcome' && ! ($model && class_exists($model))) {
                continue; // malformed entry — nothing safe to act on
            }

            try {
                if ($model === 'pivot:trainee_learning_outcome') {
                    $trainee = Trainees::find($entry['trainee_id'] ?? null);
                    $trainee?->learningOutcomes()->detach($entry['outcome_id'] ?? null);
                } else {
                    $model::find($entry['id'] ?? null)?->delete();
                }
                $deletedCount++;
            } catch (\Throwable $e) {
                $errors[] = 'Could not remove ' . $this->describeEntry($entry) . ": {$e->getMessage()}";
                $remaining[] = $entry;
            }
        }

        // Only mark fully rolled back once every tracked record is gone — a
        // partial failure (e.g. FK-blocked by a later import phase) must stay
        // retryable rather than getting permanently stuck behind the "already
        // rolled back" guard. Already-deleted entries are dropped from
        // created_ids so a retry only re-attempts what actually failed.
        if (empty($errors)) {
            $log->rolled_back_at = now();
            $log->rolled_back_by_id = auth()->id();
        }
        $log->created_ids = array_values(array_reverse($remaining));
        $log->save();

        return response()->json([
            'success' => true,
            'data' => [
                'log' => $log->fresh(['importedBy:id,first_name,last_name,email', 'rolledBackBy:id,first_name,last_name,email']),
                'deleted_count' => $deletedCount,
                'errors' => $errors,
            ],
        ]);
    }

    private function describeEntry(array $entry): string
    {
        if (($entry['model'] ?? null) === 'pivot:trainee_learning_outcome') {
            return "learning outcome link (trainee #{$entry['trainee_id']}, outcome #{$entry['outcome_id']})";
        }

        return "{$entry['model']} #{$entry['id']}";
    }
}
