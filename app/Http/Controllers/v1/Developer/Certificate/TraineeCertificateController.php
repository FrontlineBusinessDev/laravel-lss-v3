<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\Controller;
use App\Models\CertificateCitation;
use App\Models\CertificateTemplate;
use App\Models\TraineeCertificate;
use App\Models\Trainees;
use App\Models\TrainerEvaluation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TraineeCertificateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('developer/certificates/trainees/index')->asCsr();
    }

    /**
     * One row per trainee, eager-loading the (nullable) issued certificate.
     * Status is derived (issued / not_issued / not_eligible), not stored, so
     * it's applied via a conditional clause rather than the generic
     * BaseController column-filter mechanism.
     */
    public function paginationSearch(Request $request): JsonResponse
    {
        $query = Trainees::query()
            ->withCompletedHours()
            ->with([
                'batch:id,batch_code',
                'school:id,school_name',
                'certificate.citation:id,title',
                'certificate.template',
            ]);

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
        if (! empty($batchIds)) {
            $query->whereIn('batch_id', $batchIds);
        }

        $schoolIds = array_values(array_filter((array) ($filters['school_id'] ?? []), fn($v) => $v !== '' && $v !== null));
        if (! empty($schoolIds)) {
            $query->whereIn('school_id', $schoolIds);
        }

        // withSum's aggregate can't be filtered via HAVING here: Laravel wraps
        // paginate()'s count query in a subquery with no GROUP BY, which
        // SQLite (and strict-mode MySQL) reject for a bare HAVING. A
        // correlated subquery in WHERE works in both the row query and the
        // wrapped count query.
        $completedHoursExpr = '(select coalesce(sum(time_spent), 0) from app_tasks'
            . ' where app_tasks.trainee_id = app_trainees.id and app_tasks.status = \'completed\')';

        // Count of the trainee's assigned-batch trainers who don't yet have a
        // submitted evaluation from this trainee — certificate issuance is
        // blocked while this is > 0 (Trainer Evaluation requirement).
        $pendingTrainerEvalExpr = '(select count(*) from app_batch_trainer'
            . ' where app_batch_trainer.batch_id = app_trainees.batch_id'
            . ' and app_batch_trainer.trainer_id not in ('
            . 'select trainer_id from app_trainer_evaluations'
            . ' where app_trainer_evaluations.trainee_id = app_trainees.id'
            . ' and app_trainer_evaluations.submitted_at is not null'
            . '))';

        $status = is_string($filters['status'] ?? null) ? $filters['status'] : 'all';
        match ($status) {
            'issued' => $query->whereHas('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            'not_issued' => $query->whereRaw("{$completedHoursExpr} >= required_hours")
                ->whereRaw("{$pendingTrainerEvalExpr} = 0")
                ->whereDoesntHave('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            'not_eligible' => $query->where(function (Builder $q) use ($completedHoursExpr, $pendingTrainerEvalExpr) {
                $q->whereRaw("{$completedHoursExpr} < required_hours")
                    ->orWhereRaw("{$pendingTrainerEvalExpr} > 0");
            }),
            default => null,
        };

        $sortable = ['first_name', 'last_name'];
        $sortBy = in_array($request->string('sort_by')->toString(), $sortable, true)
            ? $request->string('sort_by')->toString()
            : 'last_name';
        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = max(1, min((int) $request->input('per_page', 10), 100));
        $paginator = $query->paginate($perPage, ['*'], 'page', (int) $request->input('page', 1));

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

    /**
     * Issues (or re-issues) a trainee's certificate: generates certificate_no
     * on first issue, attaches the chosen citation + template, stamps issued_at.
     */
    public function issue(Request $request, int|string $trainee): JsonResponse
    {
        $traineeModel = Trainees::findOrFail($trainee);

        abort_if(
            $this->hasPendingTrainerEvaluations($traineeModel),
            422,
            'This trainee still has a pending Trainer Evaluation and is not yet eligible for certificate issuance.',
        );

        $validated = $request->validate([
            'citation_id' => [
                'required',
                Rule::exists('app_certificate_citations', 'id')->where(
                    fn($q) => $q->whereIn('applies_to', ['trainee', 'both']),
                ),
            ],
            'template_id' => [
                'nullable',
                Rule::exists('app_certificate_templates', 'id')->where(
                    fn($q) => $q->where('certificate_type', 'trainee'),
                ),
            ],
        ]);

        $certificate = DB::transaction(function () use ($traineeModel, $validated) {
            $existing = TraineeCertificate::where('trainee_id', $traineeModel->id)->first();
            $certificateNo = $existing?->certificate_no ?? $this->nextCertificateNo();

            return TraineeCertificate::updateOrCreate(
                ['trainee_id' => $traineeModel->id],
                [
                    'certificate_no' => $certificateNo,
                    'citation_id' => $validated['citation_id'],
                    'template_id' => $validated['template_id'] ?? null,
                    'issued_at' => now()->toDateString(),
                    'issued_by' => auth()->id(),
                ],
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Certificate issued successfully.',
            'data' => $certificate->load('citation', 'template'),
        ]);
    }

    /** True when the trainee has at least one assigned-batch trainer without a submitted evaluation. */
    private function hasPendingTrainerEvaluations(Trainees $trainee): bool
    {
        if (! $trainee->batch_id) {
            return false;
        }

        $assignedTrainerIds = DB::table('app_batch_trainer')->where('batch_id', $trainee->batch_id)->pluck('trainer_id');
        if ($assignedTrainerIds->isEmpty()) {
            return false;
        }

        $evaluatedTrainerIds = TrainerEvaluation::where('trainee_id', $trainee->id)
            ->whereNotNull('submitted_at')
            ->pluck('trainer_id');

        return $assignedTrainerIds->diff($evaluatedTrainerIds)->isNotEmpty();
    }

    private function nextCertificateNo(): string
    {
        $year = now()->year;
        $sequence = TraineeCertificate::whereYear('created_at', $year)->count() + 1;

        return sprintf('CERT-%d-%04d', $year, $sequence);
    }
}
