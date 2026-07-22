<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\BaseController;
use App\Models\Seminar;
use App\Models\SeminarParticipant;
use App\Support\QrCode;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SeminarListController extends BaseController
{
    protected string $model = Seminar::class;
    private const STATUS_TERMINATED = 'terminated';
    private const SEMINAR_SEQUENCE_START = 0;

    protected string $view = 'developer/seminars/index';

    protected array $searchable = ['topic'];

    protected array $filterable = [
        'status',
        'topic',
    ];

    // All seminar filters are exact-match (ids + enums), never LIKE.
    protected array $exactFilters = [
        'status',
        'topic',
    ];

    protected array $sortable = ['id', 'topic', 'seminar_code', 'date', 'created_at'];

    protected string $sortBy = 'seminar_code';

    protected array $activeColumns = ['id', 'seminar_code'];


    /**
     * Eager-load the related names + trainee count so each list row can render
     * the industry/level/program labels and seed the async-select edit labels
     * without an extra lookup (see docs/async-select.md).
     */
    // protected function newQuery(): Builder
    // {
    //     return parent::newQuery()
    //         ->with([
    //             'academicIndustry:id,name',
    //             'academicLevel:id,name',
    //             'academicProgram:id,name',
    //         ])
    //         ->withCount('trainees');
    // }

    protected function storeRules(): array
    {
        return [
            'topic' => ['required', 'string', 'max:255', 'unique:app_seminars,topic'],
            'description' => ['required', 'string'],
            'date' => ['required', 'date'],
            'venue' => ['required', 'string', 'max:255', 'unique:app_seminars,venue'],
            'fee' => ['required', 'numeric'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::in(Statuses::all())],
            'type' => ['required', 'string'],
            'is_public_url_enable' => ['required', 'boolean'],
            // seminar_code + registration_link are intentionally absent:
            // they are system-generated and must never be user-supplied.
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'topic' => ['required', 'string', 'max:255', Rule::unique('app_seminars', 'topic')->ignore($model->id)],
            'venue' => ['required', 'string', 'max:255', Rule::unique('app_seminars', 'venue')->ignore($model->id)],
            'seminar_code' => ['required', 'string', 'max:50', Rule::unique('app_seminars', 'seminar_code')->ignore($model->id)],
            'description' => ['required', 'string'],
            'date' => ['required', 'date'],
            'fee' => ['required', 'numeric'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::in(Statuses::all())],
            'registered_count' => ['required', 'string'],
            'registration_link' => ['required', 'string'],
            'is_public_url_enable' => ['required', 'boolean'],
        ];
    }

    /**
     * Create a batch, stamping the auto-generated code + public token. The
     * generation runs inside a transaction; the unique indexes on seminar_code
     * and registration_link are the concurrency backstop.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());

        $seminar = DB::transaction(fn() => Seminar::create([
            ...$validated,
            'status' => $validated['status'] ?? self::STATUS_ACTIVE,
            'seminar_code' => $this->nextSeminarCode(),
            'registration_link' => $this->generatePublicToken(),
        ]));

        return $this->sendResponse(
            $this->resolveModel($seminar->id),
            'Record created successfully.',
            201,
        );
    }

    /**
     * Cascading hard-delete: a batch's trainee/task/leave-request/rating FKs
     * are all restrictOnDelete, so the DB rejects deleting a batch that still
     * has any of them. Per product decision, batch delete is destructive —
     * it removes every trainee under the batch (and everything under each
     * trainee, via TraineeCascadeDeleter) rather than blocking on them.
     * Runs under one locked transaction so a concurrent write can't leave
     * orphaned rows if something fails partway through.
     */
    public function destroy(int|string $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $seminar = $this->newQuery()->lockForUpdate()->findOrFail($id);
            $this->authorize('delete', $seminar);

            abort_if($seminar->status === self::STATUS_ACTIVE, 422, 'Set to inactive before deleting.');

            // Belt-and-suspenders: any seminar-scoped rows left without a
            // trainee (shouldn't normally exist, but restrictOnDelete would
            // otherwise reject the seminar delete below).
            SeminarParticipant::where('seminar_id', $seminar->id)->delete();

            $seminar->delete();

            return response()->json(null, 204);
        });
    }

    /**
     * Terminate a batch — a lifecycle end-state separate from archiving.
     */
    public function terminate(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('terminate', $model);
        $model->update(['status' => self::STATUS_TERMINATED]);

        return $this->sendResponse($model, 'Batch terminated successfully.');
    }

    /**
     * Flip the batch's public registration link on/off. Used by the inline
     * switch on the batches list; toggling off makes the public register page
     * render a graceful "closed" state (see PublicRegistrationController).
     */
    public function toggleRegistration(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $model->update(['is_public_url_enable' => ! $model->is_public_url_enable]);

        return $this->sendResponse($this->resolveModel($id), 'Public link updated successfully.');
    }

    /**
     * Return the public registration URL for this batch and a scannable QR
     * code (SVG, rendered by the pure-PHP BaconQrCode backend — no gd needed).
     */
    public function registration(int|string $id): JsonResponse
    {
        $batch = $this->resolveModel($id);
        $this->authorize('view', $batch);

        $url = route('public.register', $batch->registration_link);

        return $this->sendResponse(['url' => $url, 'qr' => $this->qrSvg($url)]);
    }

    /**
     * Render $text as an inline SVG QR code. Delegates to the shared
     * App\Support\QrCode so this and the public og:image route render identically.
     */
    protected function qrSvg(string $text): string
    {
        return QrCode::svg($text);
    }

    /**
     * Next FBS-NNN code. Reads the highest existing numeric suffix and never
     * dips below the legacy seed. Computed in PHP so it stays DB-agnostic.
     */
    protected function nextSeminarCode(): string
    {
        $highest = Seminar::query()
            ->where('seminar_code', 'like', 'FBS-S-%')
            ->pluck('seminar_code')
            ->map(fn(string $code) => (int) substr($code, 4))
            ->max() ?? 0;

        $next = max($highest + 1, self::SEMINAR_SEQUENCE_START);

        return sprintf('FBS-%03d', $next);
    }

    /**
     * Collision-resistant, URL-safe public token. Re-rolls on the (astronomically
     * unlikely) chance of a duplicate before the unique index would reject it.
     */
    protected function generatePublicToken(): string
    {
        do {
            $token = (string) Str::ulid();
            /** @disregard P1005 */
        } while (Seminar::where('registration_link', $token)->exists());

        return $token;
    }
}
