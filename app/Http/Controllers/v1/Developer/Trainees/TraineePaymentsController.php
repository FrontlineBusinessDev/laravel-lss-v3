<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\BaseController;
use App\Models\TraineesPayments;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TraineePaymentsController extends BaseController
{
    protected string $model = TraineesPayments::class;
    protected string $view = 'developer/trainees/show/PaymentDetailsTab';

    private const RECEIPT_RULES = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];

    public function storePayment(Request $request, int|string $traineeId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'official_receipt_number' => ['nullable', 'string', 'max:100'],
            'receipt' => self::RECEIPT_RULES,
        ]);

        $payment = new TraineesPayments([
            ...$validated,
            'trainee_id' => $trainee->id,
        ]);
        $this->attachReceiptFile($request, $payment);
        $payment->save();

        return $this->sendResponse($payment, 'Payment recorded successfully.', 201);
    }

    public function updatePayment(Request $request, int|string $traineeId, int|string $paymentId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $payment = TraineesPayments::where('trainee_id', $trainee->id)->findOrFail($paymentId);

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'official_receipt_number' => ['nullable', 'string', 'max:100'],
            'receipt' => self::RECEIPT_RULES,
        ]);

        $payment->fill($validated);
        $this->attachReceiptFile($request, $payment);
        $payment->save();

        return $this->sendResponse($payment, 'Payment updated successfully.');
    }

    private function attachReceiptFile(Request $request, TraineesPayments $payment): void
    {
        if (! $request->hasFile('receipt')) {
            return;
        }

        $file = $request->file('receipt');
        $folder = env('AWS_S3_STORAGE', 'laravel-ls-system') . '/payment-receipts';
        $payment->receipt_path = Storage::disk(config('filesystems.default'))->putFile($folder, $file, 'private');
        $payment->receipt_original_name = $file->getClientOriginalName();
        $payment->receipt_mime_type = $file->getClientMimeType();
        $payment->receipt_size = $file->getSize();
    }

    public function deletePayment(int|string $traineeId, int|string $paymentId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $payment = TraineesPayments::where('trainee_id', $trainee->id)->findOrFail($paymentId);
        $payment->delete();

        return response()->json(null, 204);
    }
}
