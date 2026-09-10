<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\TraineesPayments;
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

    /** rows: [{trainee_email, amount_paid, payment_date, official_receipt_number?, receipt_link?, notes?, batch_code?}] */
    public function import(Request $request): JsonResponse
    {
        $this->normalizeDateRowFields($request, ['payment_date']);

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = array_merge([
            'trainee_email' => ['required', 'email'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'official_receipt_number' => ['nullable', 'string', 'max:100'],
            'receipt_link' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ], $this->timestampRowRules());

        $errors = [];
        $warnings = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";

                continue;
            }
            ['trainee' => $trainee, 'warning' => $traineeWarning] = $this->resolveImportTrainee(trim($row['trainee_email']), $row['batch_code'] ?? null);
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";

                continue;
            }
            if ($traineeWarning) {
                $warnings[] = "Row {$rowNum}: {$traineeWarning}";
            }

            // Match on date + amount always, plus receipt number/notes when given — receipt
            // number alone isn't reliable, legacy exports often reuse the same generic text
            // (e.g. "Acknowledgement Receipt") across many distinct installment payments.
            $receiptNumber = $row['official_receipt_number'] ?? null;
            $notes = $row['notes'] ?? null;
            // whereDate(), not where() — a plain string comparison against a `date`-cast column
            // silently never matches on SQLite (stores "YYYY-MM-DD 00:00:00").
            $duplicateQuery = $trainee->payments()
                ->whereDate('payment_date', $row['payment_date'])
                ->where('amount_paid', $row['amount_paid']);
            if (! empty($receiptNumber)) {
                $duplicateQuery->where('official_receipt_number', $receiptNumber);
            }
            if (! empty($notes)) {
                $duplicateQuery->where('notes', $notes);
            }
            if ($duplicateQuery->exists()) {
                $errors[] = "Row {$rowNum}: duplicate payment for \"{$row['trainee_email']}\" on {$row['payment_date']}".
                    (! empty($receiptNumber) ? " (receipt #{$receiptNumber})" : '').
                    ' — skipped.';

                continue;
            }

            try {
                $payment = DB::transaction(function () use ($trainee, $row) {
                    $payment = $trainee->payments()->make([
                        'amount_paid' => $row['amount_paid'],
                        'payment_date' => $row['payment_date'],
                        'official_receipt_number' => $row['official_receipt_number'] ?? null,
                        'receipt_link' => $row['receipt_link'] ?? null,
                        'notes' => $row['notes'] ?? null,
                    ]);
                    $this->saveWithImportTimestamps($payment, $row);

                    return $payment;
                });
                $createdIds[] = ['model' => TraineesPayments::class, 'id' => $payment->id];
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('payments', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, $warnings, $createdIds);
    }
}
