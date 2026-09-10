<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\BaseController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Seminar;
use App\Support\QrCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * List of Seminars — real CRUD, replacing the mock-backed page. Seminar's
 * lifecycle (active/completed/closed/dissolved) has no "inactive" state, so
 * BaseController's generic archive()/restore() (which would write
 * status=inactive, an invalid value here) are never routed to — only the
 * three explicit transitions the requirements doc actually asks for are.
 */
class SeminarListController extends BaseController
{
    protected string $model = Seminar::class;

    protected string $view = 'developer/seminars/index';

    protected array $searchable = ['topic'];

    protected array $filterable = ['status', 'type'];

    protected array $exactFilters = ['status', 'type'];

    protected array $sortable = ['id', 'topic', 'date', 'created_at'];

    protected string $sortBy = 'date';

    protected array $activeColumns = ['id', 'topic'];

    /**
     * Real page: seminars + participants (ViewSeminarModal shows a per-seminar
     * participant preview), shaped to match the existing frontend Seminar/
     * SeminarParticipant types exactly so SeminarListTab/ViewSeminarModal/
     * CreateEditSeminarModal need no changes.
     */
    public function index(Request $request): mixed
    {
        $this->authorize('view', Seminar::class);

        $seminars = Seminar::query()
            ->withCount('participants')
            ->orderByDesc('date')
            ->get()
            ->map(fn(Seminar $s) => $this->mapSeminar($s));

        return InertiaPageResponse::csr($this->view, [
            'seminars' => $seminars,
            'participants' => SeminarParticipantsController::mapAll(),
        ]);
    }

    protected function storeRules(): array
    {
        return [
            'topic' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'date' => ['required', 'date'],
            'venue' => ['required', 'string', 'max:255'],
            'fee' => ['required', 'numeric', 'min:0'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'type' => ['required', 'string', 'max:255'],
        ];
    }

    protected function updateRules(\Illuminate\Database\Eloquent\Model $model): array
    {
        // Editing is only offered while a seminar is still active (see
        // SeminarListTab's disabled "Edit" action) — enforced here too.
        abort_if($model->status !== 'active', 422, 'Only an active seminar can be edited.');

        return $this->storeRules();
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules());

        $seminar = Seminar::create([
            ...$validated,
            'status' => 'active',
            'public_registration_url_id' => $this->generatePublicToken(),
            'is_public_url_enable' => true,
        ]);

        return $this->sendResponse($this->mapSeminar($seminar), 'Seminar created successfully.', 201);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $seminar = $this->resolveModel($id);
        $this->authorize('update', $seminar);
        $validated = $request->validate($this->updateRules($seminar));
        $seminar->update($validated);

        return $this->sendResponse($this->mapSeminar($seminar->fresh()), 'Seminar updated successfully.');
    }

    public function complete(int|string $id): JsonResponse
    {
        return $this->transition($id, 'completed');
    }

    public function close(int|string $id): JsonResponse
    {
        return $this->transition($id, 'closed');
    }

    public function dissolve(int|string $id): JsonResponse
    {
        return $this->transition($id, 'dissolved');
    }

    private function transition(int|string $id, string $status): JsonResponse
    {
        $seminar = $this->resolveModel($id);
        $this->authorize('transition', $seminar);
        abort_if($seminar->status !== 'active', 422, 'Only an active seminar can change status.');
        $seminar->update(['status' => $status]);

        return $this->sendResponse($this->mapSeminar($seminar->fresh()), "Seminar marked as {$status}.");
    }

    /** Flip the public registration link on/off — mirrors BatchesController::toggleRegistration(). */
    public function toggleRegistration(int|string $id): JsonResponse
    {
        $seminar = $this->resolveModel($id);
        $this->authorize('update', $seminar);
        $seminar->update(['is_public_url_enable' => ! $seminar->is_public_url_enable]);

        return $this->sendResponse($this->mapSeminar($seminar->fresh()), 'Public link updated successfully.');
    }

    /** Registration URL + scannable QR — mirrors BatchesController::registration(). */
    public function registration(int|string $id): JsonResponse
    {
        $seminar = $this->resolveModel($id);
        $this->authorize('view', $seminar);
        $url = route('public.seminars.register', $seminar->public_registration_url_id);

        return $this->sendResponse(['url' => $url, 'qr' => QrCode::svg($url)]);
    }

    protected function generatePublicToken(): string
    {
        do {
            $token = (string) Str::ulid();
            /** @disregard P1005 */
        } while (Seminar::where('public_registration_url_id', $token)->exists());

        return $token;
    }

    /** Shapes a Seminar row to match the frontend's existing `Seminar` type exactly. */
    public static function mapSeminar(Seminar $seminar): array
    {
        return [
            'id' => (string) $seminar->id,
            'topic' => $seminar->topic,
            'description' => $seminar->description,
            'date' => $seminar->date?->toDateString(),
            'venue' => $seminar->venue,
            'fee' => (float) $seminar->fee,
            'maxParticipants' => $seminar->max_participants,
            'status' => $seminar->status,
            'registeredCount' => $seminar->participants_count ?? $seminar->participants()->count(),
            'type' => $seminar->type,
            'registrationLink' => $seminar->public_registration_url_id
                ? route('public.seminars.register', $seminar->public_registration_url_id)
                : '',
            'createdAt' => $seminar->created_at?->toDateString(),
        ];
    }
}
