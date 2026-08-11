<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\CertificateCitation;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * Phase 6 — legacy lcssv2_citation onto app_certificate_citations, as
 * standalone TEMPLATES only (the legacy schema has no per-trainee issued
 * certificate to import). Legacy's industry+program-type scoping has no
 * matching columns here, so it's folded into a synthesized title. Legacy
 * placeholder tokens like "(School name)" are carried over as-is — they
 * don't match this app's {{token}} syntax and need a manual touch-up.
 */
class CitationImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** rows: [{industry, program_type, message}] */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = [
            'industry' => ['required', 'string'],
            'program_type' => ['required', 'string'],
            'message' => ['required', 'string'],
        ];

        $errors = [];
        $warnings = ['Imported citation templates carry legacy "(Placeholder)" tokens as-is — rewrite them to this app\'s {{token}} syntax before issuing certificates from them.'];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $body = trim($row['message']);
            if ($body === '') {
                $errors[] = "Row {$rowNum}: message is required.";
                continue;
            }

            try {
                $citation = DB::transaction(fn () => CertificateCitation::create([
                    'title' => "{$row['industry']} – {$row['program_type']} (imported)",
                    'applies_to' => 'trainee',
                    'body_text' => $body,
                    'status' => 'active',
                    'critical' => false,
                    'created_by' => auth()->id(),
                ]));
                $createdIds[] = ['model' => CertificateCitation::class, 'id' => $citation->id];
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('citations', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, $warnings, $createdIds);
    }
}
