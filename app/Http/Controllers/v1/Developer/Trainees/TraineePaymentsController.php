<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\TraineesPayments;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TraineePaymentsController extends BaseController
{
    protected string $model = TraineesPayments::class;
    protected string $view = 'developer/trainees/show/PaymentDetailsTab';

    public function storePayment(Request $request, int|string $traineeId): JsonResponse
    {
        $trainee = Trainees::findOrFail($traineeId);
        $this->authorize('update', $trainee);

        $validated = $request->validate([
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $payment = TraineesPayments::create([
            ...$validated,
            'trainee_id' => $trainee->id,
        ]);

        return $this->sendResponse($payment, 'Payment recorded successfully.', 201);
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
