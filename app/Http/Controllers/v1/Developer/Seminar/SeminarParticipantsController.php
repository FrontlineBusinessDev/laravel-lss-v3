<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Seminar;
use App\Models\SeminarParticipant;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Participants — real list + detail/payment updates, replacing the
 * placeholder `<div>index</div>` stub. Participants are only ever CREATED via
 * public registration (see PublicSeminarRegistrationController), so this
 * controller only reads and updates, no store()/destroy().
 */
class SeminarParticipantsController extends Controller
{
    use AuthorizesRequests;

    public function index(): mixed
    {
        $this->authorize('view', Seminar::class);

        $seminars = Seminar::query()
            ->withCount('participants')
            ->orderByDesc('date')
            ->get()
            ->map(fn(Seminar $s) => SeminarListController::mapSeminar($s));

        return InertiaPageResponse::csr('developer/seminars/participants/index', [
            'seminars' => $seminars,
            'participants' => self::mapAll(),
        ]);
    }

    /**
     * Registration + payment/checklist patch, matching ParticipantsTab's
     * `onUpdate(id, patch: Partial<SeminarParticipant>)` shape: a `progress`
     * object (the 5 checklist booleans) and/or a `payment` object.
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $this->authorize('update', Seminar::class);
        $participant = SeminarParticipant::findOrFail($id);

        $validated = $request->validate([
            'progress' => ['sometimes', 'array'],
            'progress.registration' => ['sometimes', 'boolean'],
            'progress.payment' => ['sometimes', 'boolean'],
            'progress.seminarProper' => ['sometimes', 'boolean'],
            'progress.feedbackForm' => ['sometimes', 'boolean'],
            'progress.certificate' => ['sometimes', 'boolean'],
            'payment' => ['sometimes', 'array'],
            'payment.status' => ['sometimes', 'in:Pending,Paid,Refunded,Waived'],
            'payment.date' => ['sometimes', 'nullable', 'date'],
            'payment.amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'payment.referenceNo' => ['sometimes', 'nullable', 'string', 'max:255'],
            'payment.remarks' => ['sometimes', 'nullable', 'string'],
        ]);

        $attributes = [];
        if ($progress = $validated['progress'] ?? null) {
            $map = [
                'registration' => 'registration_done',
                'payment' => 'payment_done',
                'seminarProper' => 'seminar_proper_done',
                'feedbackForm' => 'feedback_form_done',
                'certificate' => 'certificate_done',
            ];
            foreach ($map as $key => $column) {
                if (array_key_exists($key, $progress)) {
                    $attributes[$column] = $progress[$key];
                }
            }
        }
        if ($payment = $validated['payment'] ?? null) {
            if (array_key_exists('status', $payment)) {
                $attributes['payment_status'] = $payment['status'];
            }
            if (array_key_exists('date', $payment)) {
                $attributes['payment_date'] = $payment['date'];
            }
            if (array_key_exists('amount', $payment)) {
                $attributes['amount_paid'] = $payment['amount'];
            }
            if (array_key_exists('referenceNo', $payment)) {
                $attributes['reference_no'] = $payment['referenceNo'];
            }
            if (array_key_exists('remarks', $payment)) {
                $attributes['payment_remarks'] = $payment['remarks'];
            }
        }

        $participant->update($attributes);

        return response()->json([
            'success' => true,
            'message' => 'Participant updated successfully.',
            'data' => self::mapOne($participant->fresh()),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    public static function mapAll(): array
    {
        return SeminarParticipant::query()
            ->with(['seminar:id,topic', 'certificate:id,seminar_participant_id,certificate_no,issued_at'])
            ->withExists(['evaluation as has_evaluation' => fn($q) => $q->whereNotNull('submitted_at')])
            ->get()
            ->map(fn(SeminarParticipant $p) => self::mapOne($p))
            ->values()
            ->all();
    }

    public static function mapOne(SeminarParticipant $p): array
    {
        return [
            'id' => (string) $p->id,
            'name' => $p->name,
            'email' => $p->email,
            'seminarTopic' => $p->seminar?->topic ?? '—',
            'status' => $p->status,
            'certificate' => [
                'issued' => (bool) $p->certificate,
                'issuedDate' => $p->certificate?->issued_at?->toDateString(),
                'certificateNo' => $p->certificate?->certificate_no,
            ],
            'mobile' => $p->mobile,
            'location' => $p->location,
            'profession' => $p->profession,
            'isStudent' => (bool) $p->is_student,
            'studentId' => $p->student_id,
            'registeredAt' => $p->registered_at?->toDateString(),
            'progress' => [
                'registration' => (bool) $p->registration_done,
                'payment' => (bool) $p->payment_done,
                'seminarProper' => (bool) $p->seminar_proper_done,
                'feedbackForm' => (bool) $p->feedback_form_done,
                'certificate' => (bool) $p->certificate_done,
            ],
            'payment' => [
                'status' => $p->payment_status,
                'date' => $p->payment_date?->toDateString(),
                'amount' => $p->amount_paid !== null ? (float) $p->amount_paid : null,
                'referenceNo' => $p->reference_no,
                'remarks' => $p->payment_remarks,
            ],
        ];
    }
}
