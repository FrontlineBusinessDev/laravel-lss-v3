<?php

namespace App\Http\Controllers\v1\Developer\Batches;

use App\Http\Controllers\v1\BaseController;
use App\Models\Batches;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\User;
use App\Support\QrCode;
use App\Support\TraineeCascadeDeleter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Batches CRUD API (prefix /batches). Reuses BaseController's listing +
 * archive/restore/delete, and adds:
 *   - system-generated batch_code (FBS-NNN) and public_registration_url_id,
 *     neither of which is ever accepted from user input,
 *   - a Terminate transition, and
 *   - a QR/registration-link endpoint for the public sign-up URL.
 */
class BatchesController extends BaseController
{
    // ── Batch number seed ────────────────────────────────────────────────
    // Batch codes render as FBS-NNN (e.g. FBS-076). Legacy/migrated batches
    // occupied 1..75, so live auto-generation MUST begin at 76. To move the
    // starting point in the future, change ONLY this constant.
    private const BATCH_SEQUENCE_START = 76;

    /** Terminated is a lifecycle end-state distinct from the active/inactive archive flag. */
    private const STATUS_TERMINATED = 'terminated';

    protected string $model = Batches::class;

    protected string $view = 'developer/batches/index';

    protected array $searchable = ['batch_code'];

    protected array $filterable = [
        'status',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];

    // All batch filters are exact-match (ids + enums), never LIKE.
    protected array $exactFilters = [
        'status',
        'setup',
        'academic_industry_id',
        'academic_level_id',
        'academic_program_id',
    ];

    protected array $sortable = ['id', 'batch_code', 'date_started', 'created_at'];

    protected string $sortBy = 'batch_code';

    protected array $activeColumns = ['id', 'batch_code'];

    /**
     * Eager-load the related names + trainee count so each list row can render
     * the industry/level/program labels and seed the async-select edit labels
     * without an extra lookup (see docs/async-select.md).
     */
    protected function newQuery(): Builder
    {
        return parent::newQuery()
            ->with([
                'academicIndustry:id,name',
                'academicLevel:id,name',
                'academicProgram:id,name',
            ])
            ->withCount('trainees');
    }

    protected function storeRules(): array
    {
        return [
            'setup' => ['required', Rule::in(['f2f', 'online'])],
            'is_public_url_enable' => ['required', 'boolean'],
            'date_started' => ['required', 'date'],
            'projected_end_date' => ['nullable', 'date', 'after_or_equal:date_started'],
            'academic_industry_id' => ['required', 'integer', 'exists:app_settings_academic_industry,id'],
            'academic_level_id' => ['required', 'integer', 'exists:app_settings_academic_level,id'],
            'academic_program_id' => ['required', 'integer', 'exists:app_settings_academic_program,id'],
            // batch_code + public_registration_url_id are intentionally absent:
            // they are system-generated and must never be user-supplied.
        ];
    }

    protected function updateRules(Model $model): array
    {
        return [
            'setup' => ['required', Rule::in(['f2f', 'online'])],
            'is_public_url_enable' => ['required', 'boolean'],
            'date_started' => ['required', 'date'],
            'projected_end_date' => ['nullable', 'date', 'after_or_equal:date_started'],
            'academic_industry_id' => ['required', 'integer', 'exists:app_settings_academic_industry,id'],
            'academic_level_id' => ['required', 'integer', 'exists:app_settings_academic_level,id'],
            'academic_program_id' => ['required', 'integer', 'exists:app_settings_academic_program,id'],
        ];
    }

    /**
     * Create a batch, stamping the auto-generated code + public token. The
     * generation runs inside a transaction; the unique indexes on batch_code
     * and public_registration_url_id are the concurrency backstop.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());

        $batch = DB::transaction(fn() => Batches::create([
            ...$validated,
            'status' => $validated['status'] ?? self::STATUS_ACTIVE,
            'batch_code' => $this->nextBatchCode(),
            'public_registration_url_id' => $this->generatePublicToken(),
        ]));

        return $this->sendResponse(
            $this->resolveModel($batch->id),
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
            $batch = $this->newQuery()->lockForUpdate()->findOrFail($id);
            $this->authorize('delete', $batch);

            abort_if($batch->status === self::STATUS_ACTIVE, 422, 'Set to inactive before deleting.');

            foreach ($batch->trainees()->get() as $trainee) {
                TraineeCascadeDeleter::delete($trainee);
            }

            // Belt-and-suspenders: any batch-scoped rows left without a
            // trainee (shouldn't normally exist, but restrictOnDelete would
            // otherwise reject the batch delete below).
            Task::where('batch_id', $batch->id)->delete();
            LeaveRequest::where('batch_id', $batch->id)->delete();
            TaskRating::where('batch_id', $batch->id)->delete();

            $batch->delete();

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

        $url = route('public.register', $batch->public_registration_url_id);

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
     * All users holding the `trainer` role, for the batch-assignment picker.
     */
    public function trainerOptions(): JsonResponse
    {
        $trainers = User::role('trainer')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn(User $u) => ['value' => $u->id, 'label' => $u->name]);

        return $this->sendResponse($trainers);
    }

    /**
     * Sync the full set of trainers assigned to this batch. Every id must
     * already hold the `trainer` Spatie role — silently rejecting a stray
     * non-trainer id here would be confusing, so it's a validation failure.
     */
    public function assignTrainers(Request $request, int|string $id): JsonResponse
    {
        $batch = $this->resolveModel($id);
        $this->authorize('update', $batch);

        $validated = $request->validate([
            'trainer_ids' => ['present', 'array'],
            'trainer_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $trainerIds = $validated['trainer_ids'];
        $nonTrainerCount = User::whereIn('id', $trainerIds)->whereDoesntHave('roles', fn($q) => $q->where('name', 'trainer'))->count();
        abort_if($nonTrainerCount > 0, 422, 'All selected users must hold the trainer role.');

        $batch->trainers()->sync($trainerIds);

        return $this->sendResponse(
            $batch->fresh()->load('trainers:id,first_name,last_name,email'),
            'Trainers updated successfully.',
        );
    }

    /**
     * Next FBS-NNN code. Reads the highest existing numeric suffix and never
     * dips below the legacy seed. Computed in PHP so it stays DB-agnostic.
     */
    protected function nextBatchCode(): string
    {
        $highest = Batches::query()
            ->where('batch_code', 'like', 'FBS-%')
            ->pluck('batch_code')
            ->map(fn(string $code) => (int) substr($code, 4))
            ->max() ?? 0;

        $next = max($highest + 1, self::BATCH_SEQUENCE_START);

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
        } while (Batches::where('public_registration_url_id', $token)->exists());

        return $token;
    }
}
