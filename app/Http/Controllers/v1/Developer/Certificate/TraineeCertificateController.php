<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\CertificateCitation;
use App\Models\CertificateTemplate;
use App\Models\TraineeCertificate;
use App\Models\Trainees;
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

        $status = is_string($filters['status'] ?? null) ? $filters['status'] : 'all';
        match ($status) {
            'issued' => $query->whereHas('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            'not_issued' => $query->whereColumn('completed_hours', '>=', 'required_hours')
                ->whereDoesntHave('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            'not_eligible' => $query->whereColumn('completed_hours', '<', 'required_hours'),
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

    private function nextCertificateNo(): string
    {
        $year = now()->year;
        $sequence = TraineeCertificate::whereYear('created_at', $year)->count() + 1;

        return sprintf('CERT-%d-%04d', $year, $sequence);
    }
}
