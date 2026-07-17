<?php

namespace App\Http\Controllers\v1\Developer\Payment;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\Trainees;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('developer/payments/index')->asCsr();
    }

    /** One trainee's full payment detail: billing figures + transaction history. */
    public function show(int|string $id): JsonResponse
    {
        $trainee = Trainees::query()
            ->with([
                'batch:id,batch_code',
                'school:id,school_name',
                'payments' => fn($q) => $q->orderByDesc('payment_date')->orderByDesc('id'),
            ])
            ->findOrFail($id);

        return response()->json(['data' => $trainee]);
    }

    /**
     * Payments list: one row per trainee, aggregating their real billing data
     * (Trainees.net_amount_required vs the sum of their TraineesPayments rows).
     * Supports search, multi-select batch_id/school_id filters, and a computed
     * payment_status filter (unpaid|partially_paid|fully_paid|overpaid|all) —
     * the status can't be a plain column filter since it's derived, not stored.
     */
    public function paginationSearch(Request $request): JsonResponse
    {
        $query = Trainees::query()
            ->with(['batch:id,batch_code', 'school:id,school_name'])
            ->withSum('payments as total_paid_sum', 'amount_paid');

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $filters = (array) $request->input('filters', []);

        $batchIds = array_values(array_filter((array) ($filters['batch_id'] ?? []), fn($v) => $v !== '' && $v !== null));
        if (!empty($batchIds)) {
            $query->whereIn('batch_id', $batchIds);
        }

        $schoolIds = array_values(array_filter((array) ($filters['school_id'] ?? []), fn($v) => $v !== '' && $v !== null));
        if (!empty($schoolIds)) {
            $query->whereIn('school_id', $schoolIds);
        }

        $status = is_string($filters['status'] ?? null) ? $filters['status'] : 'all';
        switch ($status) {
            case 'unpaid':
                $query->havingRaw('COALESCE(total_paid_sum, 0) <= 0');
                break;
            case 'partially_paid':
                $query->havingRaw('COALESCE(total_paid_sum, 0) > 0 AND COALESCE(total_paid_sum, 0) < net_amount_required');
                break;
            case 'fully_paid':
                $query->havingRaw('net_amount_required > 0 AND COALESCE(total_paid_sum, 0) = net_amount_required');
                break;
            case 'overpaid':
                $query->havingRaw('COALESCE(total_paid_sum, 0) > net_amount_required');
                break;
        }

        $sortable = ['first_name', 'last_name', 'net_amount_required'];
        $sortBy = in_array($request->string('sort_by')->toString(), $sortable, true)
            ? $request->string('sort_by')->toString()
            : 'last_name';
        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = max(1, min((int) $request->input('per_page', 10), 100));
        $paginator = $query->paginate($perPage, ['*'], 'page', (int) $request->input('page', 1));

        // useCrud/apiFetchJson unwraps one `data` envelope, so the paginated
        // { data, meta } payload itself must be nested under `data` here —
        // matching the shape BaseController::sendResponse() produces.
        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
        ]);
    }
}
