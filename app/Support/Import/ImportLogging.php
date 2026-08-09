<?php

namespace App\Support\Import;

use App\Models\SettingsImportLog;
use Illuminate\Http\JsonResponse;

/** Shared response/audit-log helper for every Settings > Import phase controller. */
trait ImportLogging
{
    /**
     * @param list<string> $errors per-row error messages, index-aligned isn't required — just surfaced to the admin
     * @param list<string> $warnings non-fatal notices (e.g. "unmatched question skipped")
     * @param list<array<string, mixed>> $createdIds ordered `{model, id}` (or `{model: 'pivot:trainee_learning_outcome', trainee_id, outcome_id}`)
     *        entries for records this import genuinely CREATED — used by ImportRollbackController to undo the import.
     *        Rows that only matched/updated a pre-existing record must NOT be included here.
     */
    protected function finishImport(
        string $type,
        string $fileName,
        int $totalRows,
        int $successCount,
        array $errors,
        array $warnings = [],
        array $createdIds = [],
    ): JsonResponse {
        $errorCount = count($errors);
        $status = match (true) {
            $successCount === 0 => 'failed',
            $errorCount === 0 => 'success',
            default => 'partial',
        };

        $log = SettingsImportLog::create([
            'type' => $type,
            'file_name' => $fileName,
            'imported_by_id' => auth()->id(),
            'total_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'status' => $status,
            'warnings' => $warnings,
            'created_ids' => $createdIds,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'log' => $log,
                'created_count' => $successCount,
                'errors' => $errors,
                'warnings' => $warnings,
            ],
        ]);
    }
}
