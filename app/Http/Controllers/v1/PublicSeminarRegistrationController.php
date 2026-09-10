<?php

namespace App\Http\Controllers\v1;

use App\Http\Responses\InertiaPageResponse;
use App\Models\Notification;
use App\Models\Seminar;
use App\Models\SeminarParticipant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Guest-facing public seminar registration — mirrors PublicRegistrationController
 * (batches) exactly: token-resolve, transactional create, post-commit admin
 * notification. One link per seminar (no seminar-selection dropdown), same as
 * a batch's registration link.
 *
 * NOTE: plain Controller (NOT BaseController), so it's reachable without auth.
 * No outbound participant email is sent here — Email Notifications is
 * template-management-only for this pass (see plan).
 */
class PublicSeminarRegistrationController extends Controller
{
    public function show(string $token): mixed
    {
        $seminar = $this->resolveSeminar($token);

        return InertiaPageResponse::csr('public/seminar-register/index', [
            'token' => $token,
            'seminar' => [
                'topic' => $seminar->topic,
                'description' => $seminar->description,
                'date' => $seminar->date?->toDateString(),
                'venue' => $seminar->venue,
                'fee' => (float) $seminar->fee,
                'status' => $seminar->status,
                'is_public_url_enable' => (bool) $seminar->is_public_url_enable,
            ],
        ]);
    }

    public function store(Request $request, string $token): JsonResponse
    {
        $seminar = $this->resolveSeminar($token);

        if ($seminar->status !== 'active' || ! $seminar->is_public_url_enable) {
            return response()->json([
                'success' => false,
                'message' => 'Registration for this seminar is closed.',
            ], 422);
        }

        if ($seminar->max_participants && $seminar->participants()->count() >= $seminar->max_participants) {
            return response()->json([
                'success' => false,
                'message' => 'This seminar has reached its maximum number of participants.',
            ], 422);
        }

        $validated = $request->validate($this->storeRules());

        $participant = DB::transaction(fn() => SeminarParticipant::create([
            'seminar_id' => $seminar->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'],
            'location' => $validated['location'],
            'profession' => $validated['profession'],
            'is_student' => $validated['is_student'],
            'student_id' => $validated['is_student'] ? $validated['student_id'] : null,
            'registered_at' => now(),
        ]));

        $this->notifyAdminsOfRegistration($participant, $seminar);

        return response()->json([
            'success' => true,
            'message' => 'Registration submitted successfully. Our team will be in touch.',
            'data' => ['topic' => $seminar->topic],
        ]);
    }

    protected function resolveSeminar(string $token): Seminar
    {
        return Seminar::query()
            ->where('public_registration_url_id', $token)
            ->firstOrFail();
    }

    protected function storeRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'mobile' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'profession' => ['required', 'string', 'max:255'],
            'is_student' => ['required', 'boolean'],
            'student_id' => ['required_if:is_student,true', 'nullable', 'string', 'max:100'],
        ];
    }

    /** FYI-only in-app admin notification, mirroring PublicRegistrationController's pattern. */
    private function notifyAdminsOfRegistration(SeminarParticipant $participant, Seminar $seminar): void
    {
        foreach (User::role(['admin', 'developer'])->get() as $recipient) {
            Notification::create([
                'user_id' => $recipient->id,
                'type' => 'seminar_registration.submitted',
                'title' => 'New seminar registration',
                'body' => "{$participant->name} registered for \"{$seminar->topic}\".",
                'data' => ['seminar_participant_id' => $participant->id],
            ]);
        }
    }
}
