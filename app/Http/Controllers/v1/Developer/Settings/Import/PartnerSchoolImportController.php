<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\PartnerSchools;
use App\Support\Import\ImportLogging;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/** Phase 2 — legacy lcssv2_partner_school onto app_settings_partner_schools. Match-or-create by school_name. */
class PartnerSchoolImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** POST /settings/import/partner-schools — rows: [{school_name, abbreviation?, contact_person?, contact_email?, address?}] */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = [
            'school_name' => ['required', 'string', 'max:255'],
            'abbreviation' => ['nullable', 'string', 'max:50'],
            'contact_person' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
        ];

        $errors = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $name = trim($row['school_name']);
            if ($name === '') {
                $errors[] = "Row {$rowNum}: school_name is required.";
                continue;
            }

            try {
                if (PartnerSchools::whereRaw('LOWER(school_name) = ?', [mb_strtolower($name)])->exists()) {
                    $successCount++;
                    continue;
                }

                $contactPerson = trim($row['contact_person'] ?? '');
                $parts = $contactPerson !== '' ? preg_split('/\s+/', $contactPerson, 2) : [];

                $school = DB::transaction(fn () => PartnerSchools::create([
                    'status' => Statuses::ACTIVE,
                    'school_name' => $name,
                    'abbreviation' => $row['abbreviation'] ?? null,
                    'contact_first_name' => $parts[0] ?? null,
                    'contact_last_name' => $parts[1] ?? null,
                    'contact_email' => $row['contact_email'] ?? null,
                    'physical_address' => $row['address'] ?? null,
                ]));
                $createdIds[] = ['model' => PartnerSchools::class, 'id' => $school->id];
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('partner_schools', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, [], $createdIds);
    }
}
