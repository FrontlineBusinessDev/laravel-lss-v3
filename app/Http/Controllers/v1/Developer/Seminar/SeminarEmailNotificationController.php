<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Mail\SeminarTemplateTestMail;
use App\Models\Seminar;
use App\Models\SeminarAdminAlertSetting;
use App\Models\SeminarEmailTemplate;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Email Notifications — real template management (create/edit/preview/
 * send-test/enable-disable) + admin alert toggles. Template management only
 * for this pass: no automatic send-triggers are wired to lifecycle events.
 */
class SeminarEmailNotificationController extends Controller
{
    use AuthorizesRequests;

    /** Sample values for {{placeholder}} rendering — mirrors the previous frontend-only preview. */
    private const SAMPLE_VALUES = [
        'name' => 'Carla Dizon',
        'seminarTopic' => 'Intro to Data Privacy for HR Teams',
        'seminarDate' => 'Jul 18, 2026',
        'venue' => 'FBS Training Room, Makati',
        'fee' => '750',
    ];

    public function index(): mixed
    {
        $this->authorize('view', Seminar::class);

        return InertiaPageResponse::csr('developer/seminars/email-notification/index', [
            'templates' => SeminarEmailTemplate::orderBy('id')->get()->map(fn(SeminarEmailTemplate $t) => $this->mapTemplate($t)),
            'adminAlerts' => SeminarAdminAlertSetting::orderBy('id')->get()->map(fn(SeminarAdminAlertSetting $a) => $this->mapAlert($a)),
        ]);
    }

    /** Matches EditEmailTemplateModal's `onSave(id, {subject, body})`; also handles the enable/disable toggle. */
    public function updateTemplate(Request $request, int|string $id): JsonResponse
    {
        $this->authorize('update', Seminar::class);
        $template = SeminarEmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'enabled' => ['sometimes', 'boolean'],
        ]);
        $template->update($validated);

        return response()->json(['success' => true, 'message' => 'Email template updated.', 'data' => $this->mapTemplate($template->fresh())]);
    }

    /** Looked up by `key` (not id) — the frontend SeminarAdminAlertSetting type has no id field. */
    public function toggleAlert(string $key): JsonResponse
    {
        $this->authorize('update', Seminar::class);
        $alert = SeminarAdminAlertSetting::where('key', $key)->firstOrFail();
        $alert->update(['enabled' => ! $alert->enabled]);

        return response()->json(['success' => true, 'message' => 'Alert setting updated.', 'data' => $this->mapAlert($alert->fresh())]);
    }

    /** Sends the rendered template to the requesting admin's own email address. */
    public function sendTest(int|string $id): JsonResponse
    {
        $this->authorize('view', Seminar::class);
        $template = SeminarEmailTemplate::findOrFail($id);
        $admin = auth()->user();

        Mail::to($admin->email)->queue(new SeminarTemplateTestMail(
            $this->renderPlaceholders($template->subject),
            $this->renderPlaceholders($template->body),
        ));

        return response()->json(['success' => true, 'message' => "Test email queued to {$admin->email}."]);
    }

    private function renderPlaceholders(string $text): string
    {
        return preg_replace_callback(
            '/\{\{\s*(\w+)\s*\}\}/',
            fn(array $m) => self::SAMPLE_VALUES[$m[1]] ?? $m[0],
            $text,
        );
    }

    private function mapTemplate(SeminarEmailTemplate $t): array
    {
        return [
            'id' => (string) $t->id,
            'key' => $t->key,
            'name' => $t->name,
            'trigger' => $t->trigger_description,
            'subject' => $t->subject,
            'body' => $t->body,
            'enabled' => (bool) $t->enabled,
            'updatedAt' => $t->updated_at?->toDateString(),
        ];
    }

    private function mapAlert(SeminarAdminAlertSetting $a): array
    {
        return [
            'id' => (string) $a->id,
            'key' => $a->key,
            'label' => $a->label,
            'description' => $a->description,
            'enabled' => (bool) $a->enabled,
        ];
    }
}
