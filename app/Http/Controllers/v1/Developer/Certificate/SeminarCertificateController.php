<?php

namespace App\Http\Controllers\v1\Developer\Certificate;

use App\Http\Controllers\v1\Controller;
use App\Models\SeminarCertificate;
use App\Models\SeminarParticipant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SeminarCertificateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('developer/certificates/seminar/index')->asCsr();
    }

    public function paginationSearch(Request $request): JsonResponse
    {
        $query = SeminarParticipant::query()
            ->with([
                'seminar:id,topic',
                'certificate.citation:id,title',
                'certificate.template',
            ]);

        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $filters = (array) $request->input('filters', []);

        $seminarIds = array_values(array_filter((array) ($filters['seminar_id'] ?? []), fn($v) => $v !== '' && $v !== null));
        if (! empty($seminarIds)) {
            $query->whereIn('seminar_id', $seminarIds);
        }

        $status = is_string($filters['status'] ?? null) ? $filters['status'] : 'all';
        match ($status) {
            'issued' => $query->whereHas('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            'not_issued' => $query->whereDoesntHave('certificate', fn(Builder $q) => $q->whereNotNull('issued_at')),
            default => null,
        };

        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $query->orderBy('name', $sortDir);

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

    public function issue(Request $request, int|string $participant): JsonResponse
    {
        $participantModel = SeminarParticipant::findOrFail($participant);

        $validated = $request->validate([
            'citation_id' => [
                'required',
                Rule::exists('app_certificate_citations', 'id')->where(
                    fn($q) => $q->whereIn('applies_to', ['seminar', 'both']),
                ),
            ],
            'template_id' => [
                'nullable',
                Rule::exists('app_certificate_templates', 'id')->where(
                    fn($q) => $q->where('certificate_type', 'seminar'),
                ),
            ],
        ]);

        $certificate = DB::transaction(function () use ($participantModel, $validated) {
            $existing = SeminarCertificate::where('seminar_participant_id', $participantModel->id)->first();
            $certificateNo = $existing?->certificate_no ?? $this->nextCertificateNo();

            return SeminarCertificate::updateOrCreate(
                ['seminar_participant_id' => $participantModel->id],
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
        $sequence = SeminarCertificate::whereYear('created_at', $year)->count() + 1;

        return sprintf('SEM-CERT-%d-%04d', $year, $sequence);
    }
}
