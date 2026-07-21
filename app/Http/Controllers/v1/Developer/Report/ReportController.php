<?php

namespace App\Http\Controllers\v1\Developer\Report;

use App\Http\Controllers\v1\Controller;
use App\Models\Batches;
use App\Models\Task;
use App\Support\Reports\BatchFinancialsCalculator;
use App\Support\Reports\SeminarEarnings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Reports are computed aggregations over real Batches/Trainees/Payments/Tasks/
 * Seminars data — there is no stored `Report` model. Both tabs share this
 * controller; each tab's data comes from three endpoints: a paginated list
 * (backs <DataTableCardField>), a totals endpoint (aggregates over the whole
 * filtered set, decoupled from pagination so stat cards don't collapse to the
 * current page), and an export endpoint (unpaginated, feeds the Print view).
 */
class ReportController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('reports.annual.index');
    }

    public function annual(): Response
    {
        return Inertia::render('developer/reports/annual/index')->asCsr();
    }

    public function batch(): Response
    {
        return Inertia::render('developer/reports/batch/index')->asCsr();
    }

    public function annualSummary(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $query = $this->baseQuery($filters)->orderByDesc('date_started');

        $paginator = $this->paginate($query, $request);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => collect($paginator->items())
                    ->map(fn(Batches $batch) => $this->mapBatch($batch))
                    ->values(),
                'meta' => $this->metaFromPaginator($paginator),
            ],
        ]);
    }

    public function annualTotals(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $batches = $this->baseQuery($filters)->get();

        return response()->json([
            'financials' => BatchFinancialsCalculator::forTrainees($this->traineesFor($batches)),
            'batchCount' => $batches->count(),
            'seminarRevenue' => SeminarEarnings::total($filters['date_from'], $filters['date_to']),
        ]);
    }

    public function annualExport(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $batches = $this->baseQuery($filters)->orderByDesc('date_started')->get();

        return response()->json([
            'batches' => $batches->map(fn(Batches $batch) => $this->mapBatch($batch)),
            'seminarRevenue' => SeminarEarnings::total($filters['date_from'], $filters['date_to']),
        ]);
    }

    public function batchSummary(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $query = $this->baseQuery($filters)->orderByDesc('date_started');
        $this->applyIndustryFilter($query, $filters);

        $paginator = $this->paginate($query, $request);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => collect($paginator->items())
                    ->map(fn(Batches $batch) => $this->mapBatch($batch, withActivities: true))
                    ->values(),
                'meta' => $this->metaFromPaginator($paginator),
            ],
        ]);
    }

    public function batchTotals(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $query = $this->baseQuery($filters);
        $this->applyIndustryFilter($query, $filters);
        $batches = $query->get();

        return response()->json([
            'financials' => BatchFinancialsCalculator::forTrainees($this->traineesFor($batches)),
            'batchCount' => $batches->count(),
        ]);
    }

    public function batchExport(Request $request): JsonResponse
    {
        $filters = $this->filtersFromRequest($request);
        $query = $this->baseQuery($filters)->orderByDesc('date_started');
        $this->applyIndustryFilter($query, $filters);
        $batches = $query->get();

        return response()->json([
            'batches' => $batches->map(fn(Batches $batch) => $this->mapBatch($batch, withActivities: true)),
        ]);
    }

    /** @return array{search:?string,date_from:?string,date_to:?string,academic_industry_id:?int} */
    protected function filtersFromRequest(Request $request): array
    {
        $filters = (array) $request->input('filters', []);
        $industry = $filters['academic_industry_id'] ?? null;

        return [
            'search' => $request->input('search') ?: null,
            'date_from' => $filters['date_started_from'] ?? null,
            'date_to' => $filters['date_started_to'] ?? null,
            'academic_industry_id' => $industry !== null && $industry !== '' ? (int) $industry : null,
        ];
    }

    protected function paginate(Builder $query, Request $request)
    {
        $perPage = max(1, min((int) $request->input('per_page', 10), 100));

        return $query->paginate($perPage, ['*'], 'page', (int) $request->input('page', 1));
    }

    protected function metaFromPaginator($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    protected function applyIndustryFilter(Builder $query, array $filters): void
    {
        if (! empty($filters['academic_industry_id'])) {
            $query->where('academic_industry_id', $filters['academic_industry_id']);
        }
    }

    /** @param array{search:?string,date_from:?string,date_to:?string} $filters */
    protected function baseQuery(array $filters): Builder
    {
        return Batches::query()
            ->with(['academicIndustry:id,name', 'academicLevel:id,name', 'academicProgram:id,name'])
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->whereDate('date_started', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->whereDate('date_started', '<=', $v))
            ->when($filters['search'] ?? null, function ($q, $term) {
                $q->where(function ($qq) use ($term) {
                    $qq->where('batch_code', 'like', "%{$term}%")
                        ->orWhereHas('trainees', function ($t) use ($term) {
                            $t->where('first_name', 'like', "%{$term}%")
                                ->orWhere('last_name', 'like', "%{$term}%");
                        });
                });
            });
    }

    /** @param Collection<int, Batches> $batches */
    protected function traineesFor(Collection $batches): Collection
    {
        return $batches->flatMap(fn(Batches $batch) => $batch->trainees()->withCompletedHours()->get());
    }

    protected function mapBatch(Batches $batch, bool $withActivities = false): array
    {
        $trainees = $batch->trainees()->withCompletedHours()->get();
        $financials = BatchFinancialsCalculator::forTrainees($trainees);

        $data = [
            'id' => $batch->id,
            'batchNo' => $batch->batch_code,
            'programType' => $batch->academicProgram?->name ?? '—',
            'industry' => $batch->academicIndustry?->name ?? '—',
            'setup' => $batch->setup,
            'status' => $batch->status,
            'started' => $batch->date_started?->format('M j, Y') ?? '',
            'projectedEnd' => $batch->projected_end_date?->format('M j, Y') ?? '',
            'createdDate' => $batch->created_at?->format('M j, Y') ?? '',
            'financials' => $financials,
            'trainees' => $trainees->map(fn($t) => [
                'id' => $t->id,
                'name' => trim("{$t->first_name} {$t->last_name}"),
                'school' => $t->school?->school_name ?? '—',
                'requiredHrs' => (float) $t->required_hours,
                'completedHrs' => (float) ($t->completed_hours ?? 0),
                'status' => $t->status,
                'totalAmountPaid' => (float) $t->total_paid,
                'outstandingBalance' => (float) $t->outstanding_balance,
                'netAmountDue' => (float) $t->net_amount_required,
            ])->values(),
        ];

        if ($withActivities) {
            $data['activities'] = $this->completedActivities($batch->id);
        }

        return $data;
    }

    /** @return Collection<int, array<string, mixed>> */
    protected function completedActivities(int $batchId): Collection
    {
        return Task::query()
            ->where('batch_id', $batchId)
            ->where('status', 'completed')
            ->with(['trainee:id,first_name,last_name', 'trainer:id,first_name,last_name'])
            ->orderByDesc('date')
            ->get()
            ->map(fn(Task $task) => [
                'id' => $task->id,
                'task' => $task->task,
                'trainee' => $task->trainee ? trim("{$task->trainee->first_name} {$task->trainee->last_name}") : '—',
                'trainer' => $task->trainer ? trim("{$task->trainer->first_name} {$task->trainer->last_name}") : '—',
                'timeGoal' => (float) $task->time_goal,
                'timeSpent' => (float) $task->time_spent,
                'date' => $task->date?->format('M j, Y') ?? '',
            ])
            ->values();
    }
}
