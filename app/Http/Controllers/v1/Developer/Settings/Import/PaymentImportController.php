<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\Trainees;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/** Phase 5a — legacy lcssv2_payment onto app_trainees_payments, matched by the trainee's email. */
class PaymentImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** rows: [{trainee_email, amount_paid, payment_date, official_receipt_number?, receipt_link?}] */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.trainee_email' => ['required', 'email'],
            'rows.*.amount_paid' => ['required', 'numeric', 'min:0.01'],
            'rows.*.payment_date' => ['required', 'date'],
            'rows.*.official_receipt_number' => ['nullable', 'string', 'max:100'],
            'rows.*.receipt_link' => ['nullable', 'string'],
        ]);

        $errors = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            $trainee = Trainees::where('email', trim($row['trainee_email']))->first();
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";
                continue;
            }

            $notes = ! empty($row['receipt_link']) ? "Legacy receipt link: {$row['receipt_link']}" : null;

            try {
                $payment = DB::transaction(fn () => $trainee->payments()->create([
                    'amount_paid' => $row['amount_paid'],
                    'payment_date' => $row['payment_date'],
                    'official_receipt_number' => $row['official_receipt_number'] ?? null,
                    'notes' => $notes,
                ]));
                $createdIds[] = ['model' => \App\Models\TraineesPayments::class, 'id' => $payment->id];
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('payments', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, [], $createdIds);
    }
}
