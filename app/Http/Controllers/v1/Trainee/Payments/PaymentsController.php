<?php

namespace App\Http\Controllers\v1\Trainee\Payments;

use App\Models\PaymentMethod;
use App\Models\Trainees;
use App\Models\TraineesPayments;
use App\Support\Statuses;
use App\Traits\HandlesFileUploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainee-facing Payments API (prefix /trainee/payments), scoped to the
 * payment history of the trainee record linked to the authenticated user.
 * Display-only: trainees never store/update/delete a payment — that stays
 * an admin-only action via TraineePaymentsController.
 */
class PaymentsController
{
    use HandlesFileUploads;

    protected array $fileFields = ['logo', 'qr_code'];
    protected int $fileUrlExpiry = 60;

    public function index(): Response
    {
        $trainee = $this->currentTrainee();

        $paymentMethods = PaymentMethod::query()
            ->where('status', Statuses::ACTIVE)
            ->orderBy('display_order')
            ->get()
            ->map(fn (PaymentMethod $method) => $this->transformFileUrls($method));

        return Inertia::render('trainee/payments/index', [
            'summary' => [
                'gross_amount' => $trainee->gross_amount,
                'total_discount_amount' => $trainee->total_discount_amount,
                'net_amount_required' => $trainee->net_amount_required,
                'total_paid' => $trainee->total_paid,
                'outstanding_balance' => $trainee->outstanding_balance,
            ],
            'paymentMethods' => $paymentMethods,
        ])->asCsr();
    }

    public function paginationSearch(Request $request): JsonResponse
    {
        $trainee = $this->currentTrainee();

        $filters = (array) $request->input('filters', []);
        $sortByParam = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $sortable = ['payment_date', 'amount_paid', 'created_at'];

        $query = TraineesPayments::query()->where('trainee_id', $trainee->id);

        if (! empty($filters['payment_date_from'])) {
            $query->whereDate('payment_date', '>=', $filters['payment_date_from']);
        }
        if (! empty($filters['payment_date_to'])) {
            $query->whereDate('payment_date', '<=', $filters['payment_date_to']);
        }

        if ($sortByParam !== '' && in_array($sortByParam, $sortable, true)) {
            $query->orderBy($sortByParam, $sortDir);
        } else {
            $query->orderBy('payment_date', 'desc');
        }

        $perPage = (int) $request->input('per_page', 10);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        return response()->json([
            'success' => true,
            'data' => [
                'data' => collect($paginator->items())->values(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
                'links' => [
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
                'filters' => $filters,
                'search' => '',
                'sort_by' => $sortByParam,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    protected function currentTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
